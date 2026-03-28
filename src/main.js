import './style.css';
import {
  achievementCatalog,
  courseCatalog,
  dailyChallenges,
  defaultProfile,
  forumThreads,
  leaderboard,
  practicePartners,
  codeReviewRequests,
  pricingPlans
} from './data/platformData.js';
import {
  appendActivityEvent,
  appendAgentSession,
  appendMentorNote,
  createDefaultLearningWorkspace,
  loadRemoteLearningWorkspace,
  mergeLearningWorkspace,
  saveRemoteLearningWorkspace,
  upsertLessonSession,
  upsertStudyPlan
} from './services/learningBackend.js';

const STORAGE_KEY = 'codequest_hq_v3';
const PAYMENTS_ENABLED = false;
const courseMap = new Map(courseCatalog.map((course) => [course.id, course]));
const app = document.getElementById('app');

let toastTimer = null;
let cloudTimer = null;
let backendContextPromise = null;
let aiToolsPromise = null;

const state = {
  route: 'dashboard',
  selectedCourseId: 'javascript-web-apps',
  practiceMode: 'coding',
  codingCourseId: 'javascript-web-apps',
  languageCourseId: 'spanish-conversation',
  catalogFilter: 'all',
  catalogQuery: '',
  communityTab: 'forums',
  authModalOpen: false,
  authMode: 'login',
  authBusy: false,
  authError: '',
  user: null,
  syncStatus: 'Local only',
  toast: '',
  aiAgentType: 'planner',
  aiBusy: false,
  aiError: '',
  aiSettingsOpen: false,
  flashcardIndex: 0,
  flashcardFlipped: false,
  codingDrafts: {},
  codingOutput: 'Run code or tests to see output here.',
  codingTestResults: [],
  codingFeedback: '',
  practiceFeedback: '',
  dailyChallengeFeedback: '',
  profile: clone(defaultProfile),
  learningWorkspace: createDefaultLearningWorkspace()
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function ensureBackend() {
  if (!backendContextPromise) {
    backendContextPromise = import('./services/supabase.js');
  }

  return backendContextPromise;
}

async function ensureAiTools() {
  if (!aiToolsPromise) {
    aiToolsPromise = import('./services/aiService.js');
  }

  return aiToolsPromise;
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, override) {
  const result = clone(base);

  Object.entries(override || {}).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (isObject(value) && isObject(base?.[key])) {
      result[key] = deepMerge(base[key], value);
      return;
    }

    result[key] = clone(value);
  });

  return result;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCurrentDailyChallenge() {
  const index = hashString(getTodayKey()) % dailyChallenges.length;
  return dailyChallenges[index];
}

function isDailyChallengeComplete() {
  return state.profile.dailyChallengeHistory?.[getTodayKey()] === getCurrentDailyChallenge().id;
}

function getRouteTitle() {
  const titles = {
    welcome: 'Choose Your Path',
    dashboard: 'Learn',
    courses: 'Paths',
    'course-detail': 'Path',
    practice: 'Practice',
    community: 'Friends',
    pricing: PAYMENTS_ENABLED ? 'Plans' : 'Roadmap',
    profile: 'Profile'
  };

  return titles[state.route] || 'CodeQuest AI';
}

function getNavKey(route) {
  return route === 'course-detail' ? 'courses' : route;
}

function getInitials(name) {
  return (name || 'Guest Learner')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function getAuthDisplayName(user) {
  return (
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    state.profile.name ||
    'Learner'
  );
}

function getAuthProvider(user) {
  const providers = user?.app_metadata?.providers || [];

  if (providers.includes('google')) {
    return 'google';
  }

  return user?.app_metadata?.provider || providers[0] || 'email';
}

function getLevelFromXp(xp) {
  return Math.floor(xp / 180) + 1;
}

function getXpIntoLevel(xp) {
  return xp % 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCourseTypeCourses(type) {
  return courseCatalog.filter((course) => course.type === type);
}

function hasCompletedOnboarding() {
  return Boolean(state.profile.preferences?.onboardingComplete);
}

function getPrimaryCourse() {
  const primaryCourseId = state.profile.preferences?.primaryCourseId;
  return courseMap.get(primaryCourseId) || null;
}

function getActivePracticeCourse() {
  if (state.practiceMode === 'language') {
    return courseMap.get(state.languageCourseId);
  }

  if (state.practiceMode === 'coding') {
    return courseMap.get(state.codingCourseId);
  }

  return courseMap.get(state.selectedCourseId) || getRecommendedCourse();
}

function getPlanCourse() {
  const plannedId = state.learningWorkspace.studyPlan?.courseId;
  return courseMap.get(plannedId) || courseMap.get(state.selectedCourseId) || getRecommendedCourse();
}

function getAiModeLabel() {
  return state.learningWorkspace.aiModeLabel || 'Local coach';
}

function recordLearningEvent(type, courseId, message) {
  appendActivityEvent(state.learningWorkspace, {
    id: `${type}-${Date.now()}`,
    type,
    courseId,
    message,
    createdAt: new Date().toISOString()
  });
}

function createLessonSession(course) {
  const progress = ensureCourseProgress(course.id);
  const activeModule =
    course.modules.find((module) => module.stage === progress.pathStage) || course.modules[0];
  const focusLesson = progress.currentLesson || activeModule?.lessons?.[0] || 'Core concept review';
  const practiceLesson = progress.nextLesson || activeModule?.lessons?.[1] || focusLesson;

  return {
    courseId: course.id,
    title: `${course.title} guided mission`,
    summary:
      course.type === 'coding'
        ? 'Review the concept, ship one working solution, and capture the debugging lesson.'
        : 'Warm up with meaning, practice pronunciation, and finish with active recall.',
    tasks: [
      {
        id: `${course.id}-mission-review`,
        title: `Revisit ${focusLesson}`,
        description:
          course.type === 'coding'
            ? `Read the idea behind ${focusLesson} and state the rule in your own words.`
            : `Review the key phrase from ${focusLesson} and say it out loud once slowly and once normally.`,
        status: 'pending'
      },
      {
        id: `${course.id}-mission-practice`,
        title: `Practice ${practiceLesson}`,
        description:
          course.type === 'coding'
            ? `Use the coding studio to solve one task linked to ${practiceLesson}.`
            : `Use the language studio to answer one flashcard and one translation prompt linked to ${practiceLesson}.`,
        status: 'pending'
      },
      {
        id: `${course.id}-mission-reflect`,
        title: 'Capture one learning note',
        description:
          course.type === 'coding'
            ? 'Write one debugging or syntax insight you want to remember tomorrow.'
            : 'Write one pronunciation or vocabulary reminder for your next session.',
        status: 'pending'
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

function buildStarterStudyPlan(course) {
  const session = createLessonSession(course);
  const focusArea = ensureCourseProgress(course.id).currentLesson;

  return {
    courseId: course.id,
    headline: `Start strong with ${course.title}`,
    focusArea,
    rationale: `You selected ${course.language} as your current focus. This plan keeps the first session simple and clear.`,
    tasks: session.tasks.map((task, index) => ({
      id: `${course.id}-plan-${index + 1}`,
      title: task.title,
      type: index === 1 ? 'practice' : 'review',
      duration: `${10 + index * 5} min`,
      instruction: task.description,
      successMetric: index === 1 ? 'Complete the hands-on step.' : 'Capture one takeaway.'
    })),
    coachTip:
      course.type === 'coding'
        ? 'Work through one clean example before trying multiple variations.'
        : 'Say each answer aloud once so it sticks faster.',
    generatedAt: new Date().toISOString(),
    source: 'local'
  };
}

function ensureLessonSession(courseId) {
  const course = courseMap.get(courseId);
  const existing = state.learningWorkspace.lessonSessions?.[courseId];

  if (existing) {
    return existing;
  }

  const created = createLessonSession(course);
  upsertLessonSession(state.learningWorkspace, created);
  return created;
}

function bootstrapLearningWorkspace() {
  const recommended = getRecommendedCourse();

  if (!state.learningWorkspace.studyPlan) {
    upsertStudyPlan(state.learningWorkspace, buildStarterStudyPlan(recommended));
  }

  ensureLessonSession(state.codingCourseId);
  ensureLessonSession(state.languageCourseId);
}

function getCourseAccessLabel(course) {
  if (!PAYMENTS_ENABLED) {
    return 'Open beta';
  }

  if (course.access === 'free') {
    return 'Free';
  }

  if (course.access === 'pro') {
    return 'Pro';
  }

  return 'One-time purchase';
}

function canAccessCourse(course) {
  if (!PAYMENTS_ENABLED) {
    return true;
  }

  if (course.access === 'free') {
    return true;
  }

  if (state.profile.subscription === 'pro') {
    return true;
  }

  if (course.access === 'purchase') {
    return state.profile.purchasedCourses.includes(course.id);
  }

  return false;
}

function buildEmptyProgress(course) {
  const skills =
    course.type === 'coding'
      ? {
          Syntax: 0,
          Debugging: 0,
          'Problem solving': 0
        }
      : {
          Reading: 0,
          Writing: 0,
          Speaking: 0
        };

  return {
    enrolled: false,
    completion: 0,
    quizAverage: 0,
    timeSpent: 0,
    xp: 0,
    currentLesson: 'Getting started',
    nextLesson: course.modules?.[0]?.lessons?.[0] || 'First lesson',
    pathStage: course.modules?.[0]?.stage || 'Beginner',
    skills
  };
}

function ensureCourseProgress(courseId) {
  if (!state.profile.courseProgress[courseId]) {
    const course = courseMap.get(courseId);
    state.profile.courseProgress[courseId] = buildEmptyProgress(course);
  }

  return state.profile.courseProgress[courseId];
}

function syncBadges() {
  const badges = new Set(state.profile.badges || []);
  const progressEntries = Object.entries(state.profile.courseProgress || {});

  if (progressEntries.some(([, progress]) => progress.enrolled)) {
    badges.add('starter');
  }

  if ((state.profile.streak || 0) >= 7) {
    badges.add('streak-7');
  }

  if ((state.profile.stats?.codeRuns || 0) >= 3) {
    badges.add('code-runner');
  }

  if ((state.profile.stats?.reviewsCompleted || 0) >= 5) {
    badges.add('review-master');
  }

  const activeLanguageCount = progressEntries.filter(([courseId, progress]) => {
    const course = courseMap.get(courseId);
    return course?.type === 'language' && progress.enrolled;
  }).length;

  if (activeLanguageCount >= 2) {
    badges.add('polyglot');
  }

  if (state.profile.subscription === 'pro') {
    badges.add('pro-member');
  }

  if (progressEntries.some(([, progress]) => progress.completion >= 100)) {
    badges.add('course-finisher');
  }

  state.profile.badges = Array.from(badges);
}

function touchDailyActivity() {
  const today = getTodayKey();
  const last = state.profile.lastActiveDate;

  if (last === today) {
    return;
  }

  const yesterday = addDays(today, -1);

  if (last === yesterday) {
    state.profile.streak += 1;
  } else {
    state.profile.streak = 1;
  }

  state.profile.lastActiveDate = today;
}

function seedCodingDrafts() {
  courseCatalog
    .filter((course) => course.type === 'coding')
    .forEach((course) => {
      if (!state.codingDrafts[course.id]) {
        state.codingDrafts[course.id] = course.codingStudio.starterCode;
      }
    });
}

function seedReviewQueue() {
  const queue = state.profile.reviewQueue || {};

  getCourseTypeCourses('language').forEach((course) => {
    course.languageStudio.flashcards.forEach((card, index) => {
      if (!queue[card.id]) {
        queue[card.id] = {
          id: card.id,
          prompt: card.front,
          answer: card.back,
          pronunciation: card.pronunciation,
          courseId: course.id,
          dueOn: addDays(getTodayKey(), index === 0 ? 0 : 1),
          interval: 1 + index,
          ease: 2.4
        };
      }
    });
  });

  state.profile.reviewQueue = queue;
}

function hydrateState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    touchDailyActivity();
    seedCodingDrafts();
    seedReviewQueue();
    syncBadges();
    bootstrapLearningWorkspace();
    if (!hasCompletedOnboarding()) {
      state.route = 'welcome';
    }
    return;
  }

  try {
    const saved = JSON.parse(raw);
    state.profile = deepMerge(defaultProfile, saved.profile || {});
    state.learningWorkspace = mergeLearningWorkspace(
      createDefaultLearningWorkspace(),
      saved.learningWorkspace || {}
    );
    state.route = saved.route || state.route;
    state.selectedCourseId = saved.selectedCourseId || state.selectedCourseId;
    state.practiceMode = saved.practiceMode || state.practiceMode;
    state.codingCourseId = saved.codingCourseId || state.codingCourseId;
    state.languageCourseId = saved.languageCourseId || state.languageCourseId;
    state.catalogFilter = saved.catalogFilter || state.catalogFilter;
    state.catalogQuery = saved.catalogQuery || state.catalogQuery;
    state.communityTab = saved.communityTab || state.communityTab;
    state.aiAgentType = saved.aiAgentType || state.aiAgentType;
    state.codingDrafts = saved.codingDrafts || {};
  } catch (error) {
    console.warn('Failed to restore local state', error);
    state.profile = clone(defaultProfile);
    state.learningWorkspace = createDefaultLearningWorkspace();
  }

  touchDailyActivity();
  seedCodingDrafts();
  seedReviewQueue();
  syncBadges();
  bootstrapLearningWorkspace();

  if (!hasCompletedOnboarding()) {
    state.route = 'welcome';
  }
}

function saveLocalState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      profile: state.profile,
      learningWorkspace: state.learningWorkspace,
      route: state.route,
      selectedCourseId: state.selectedCourseId,
      practiceMode: state.practiceMode,
      codingCourseId: state.codingCourseId,
      languageCourseId: state.languageCourseId,
      catalogFilter: state.catalogFilter,
      catalogQuery: state.catalogQuery,
      communityTab: state.communityTab,
      aiAgentType: state.aiAgentType,
      codingDrafts: state.codingDrafts
    })
  );
}

function scheduleCloudSync() {
  saveLocalState();

  if (!state.user) {
    return;
  }

  clearTimeout(cloudTimer);
  cloudTimer = window.setTimeout(async () => {
    try {
      const backend = await ensureBackend();
      await Promise.all([
        backend.saveProfile(state.user.id, state.profile),
        saveRemoteLearningWorkspace(backend, state.user.id, state.learningWorkspace)
      ]);
      state.syncStatus = 'Supabase sync active';
      renderApp();
    } catch (error) {
      console.warn('Cloud sync failed', error);
      state.syncStatus = 'Supabase sync unavailable';
      renderApp();
    }
  }, 300);
}

function showToast(message) {
  state.toast = message;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = '';
    renderApp();
  }, 2600);
}

function commit(message) {
  syncBadges();
  scheduleCloudSync();
  if (message) {
    showToast(message);
  }
  renderApp();
}

function getRecommendedCourse() {
  const primaryCourse = getPrimaryCourse();

  if (primaryCourse) {
    return primaryCourse;
  }

  const enrolled = Object.entries(state.profile.courseProgress)
    .map(([courseId, progress]) => ({ courseId, progress }))
    .filter(({ progress }) => progress.enrolled && progress.completion < 100)
    .sort((left, right) => right.progress.completion - left.progress.completion);

  const recommendedId = enrolled[0]?.courseId || 'javascript-web-apps';
  return courseMap.get(recommendedId);
}

function getDueReviewCards() {
  const today = getTodayKey();
  return Object.values(state.profile.reviewQueue || {}).filter((item) => item.dueOn <= today);
}

function getTotalCertificatesReady() {
  return courseCatalog.filter((course) => {
    const progress = state.profile.courseProgress[course.id];
    if (!progress || progress.completion < 100) {
      return false;
    }

    return canAccessCourse(course);
  }).length;
}

function awardXp(amount, options = {}) {
  touchDailyActivity();
  state.profile.xp += amount;

  if (options.courseId) {
    const progress = ensureCourseProgress(options.courseId);
    progress.xp += amount;
  }
}

function advanceCourseProgress(courseId, updates = {}) {
  const progress = ensureCourseProgress(courseId);
  progress.enrolled = true;
  progress.completion = clamp(progress.completion + (updates.completion || 0), 0, 100);
  progress.timeSpent += updates.minutes || 0;
  progress.quizAverage = updates.quizAverage
    ? progress.quizAverage
      ? Math.round((progress.quizAverage + updates.quizAverage) / 2)
      : updates.quizAverage
    : progress.quizAverage;

  Object.entries(updates.skills || {}).forEach(([skill, value]) => {
    progress.skills[skill] = clamp((progress.skills[skill] || 0) + value, 0, 100);
  });

  if (updates.currentLesson) {
    progress.currentLesson = updates.currentLesson;
  }

  if (updates.nextLesson) {
    progress.nextLesson = updates.nextLesson;
  }

  if (updates.pathStage) {
    progress.pathStage = updates.pathStage;
  }

  state.profile.totalMinutes += updates.minutes || 0;
  state.profile.weeklyMinutes += updates.minutes || 0;
}

function enrollCourse(courseId) {
  const course = courseMap.get(courseId);

  if (!canAccessCourse(course)) {
    state.route = 'pricing';
    commit(`Unlock ${course.title} from the pricing page.`);
    return;
  }

  const progress = ensureCourseProgress(courseId);
  const firstEnrollment = !progress.enrolled;
  progress.enrolled = true;
  state.selectedCourseId = courseId;
  state.route = 'course-detail';

  if (firstEnrollment) {
    awardXp(25, { courseId });
    commit(`${course.title} added to your learning plan.`);
    return;
  }

  commit(`${course.title} is ready to continue.`);
}

function buyCourse(courseId) {
  const course = courseMap.get(courseId);

  if (!PAYMENTS_ENABLED) {
    ensureCourseProgress(courseId).enrolled = true;
    state.selectedCourseId = courseId;
    state.route = 'course-detail';
    commit(`${course.title} unlocked in preview mode.`);
    return;
  }

  if (!state.profile.purchasedCourses.includes(courseId)) {
    state.profile.purchasedCourses.push(courseId);
  }

  ensureCourseProgress(courseId).enrolled = true;
  state.selectedCourseId = courseId;
  state.route = 'course-detail';
  commit(`${course.title} purchased and unlocked.`);
}

function upgradePlan(planId) {
  if (!PAYMENTS_ENABLED) {
    const targetPlan = pricingPlans.find((plan) => plan.id === planId);
    commit(`${targetPlan?.name || 'Plan'} checkout is disabled for now. We can add billing later.`);
    return;
  }

  if (planId === 'team') {
    commit('Teams plan interest noted. This demo routes enterprise users to sales.');
    return;
  }

  state.profile.subscription = planId;
  commit(planId === 'pro' ? 'Pro plan activated.' : 'Free plan restored.');
}

function setPracticeCourse(courseId) {
  const course = courseMap.get(courseId);
  state.selectedCourseId = courseId;
  ensureLessonSession(courseId);

  if (course.type === 'coding') {
    state.codingCourseId = courseId;
    state.practiceMode = 'coding';
  } else {
    state.languageCourseId = courseId;
    state.practiceMode = 'language';
  }

  state.route = 'practice';
  state.flashcardFlipped = false;
  state.practiceFeedback = '';
}

function formatLogValue(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function valuesEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function runJavaScriptChallenge(mode) {
  const course = courseMap.get(state.codingCourseId);
  const studio = course.codingStudio;
  const code = state.codingDrafts[course.id];
  const logs = [];
  const fakeConsole = {
    log: (...args) => {
      logs.push(args.map(formatLogValue).join(' '));
    }
  };

  if (mode === 'run') {
    try {
      const result = new Function(
        'console',
        `"use strict";\n${code}\nreturn (${studio.runExpression});`
      )(fakeConsole);
      state.codingOutput = logs.length
        ? `${logs.join('\n')}\nResult: ${formatLogValue(result)}`
        : `Result: ${formatLogValue(result)}`;
      state.codingFeedback = 'Runtime completed successfully.';
      state.codingTestResults = [];
      commit();
    } catch (error) {
      state.codingOutput = `Runtime error:\n${error.message}`;
      state.codingFeedback = 'The code needs another pass before it will run cleanly.';
      commit();
    }
    return;
  }

  try {
    const results = studio.tests.map((test) => {
      const actual = new Function(
        'console',
        `"use strict";\n${code}\nreturn (${test.expression});`
      )(fakeConsole);

      return {
        label: test.label,
        passed: valuesEqual(actual, test.expected),
        expected: formatLogValue(test.expected),
        actual: formatLogValue(actual)
      };
    });

    const allPassed = results.every((result) => result.passed);
    state.codingTestResults = results;
    state.codingOutput = logs.length ? logs.join('\n') : 'No console output captured.';
    state.codingFeedback = allPassed
      ? 'All checks passed. This challenge is ready to ship.'
      : studio.explanation;

    if (allPassed) {
      state.profile.stats.codeRuns += 1;
      awardXp(35, { courseId: course.id });
      advanceCourseProgress(course.id, {
        completion: 4,
        minutes: 12,
        quizAverage: 95,
        skills: {
          Syntax: 2,
          Debugging: 2,
          'Problem solving': 3
        }
      });
      recordLearningEvent('code-practice', course.id, `Passed coding checks in ${course.title}.`);
      commit('Coding challenge passed.');
      return;
    }

    commit('Some tests are still failing.');
  } catch (error) {
    state.codingOutput = `Test run failed:\n${error.message}`;
    state.codingFeedback = 'Fix the syntax issue and try the test suite again.';
    commit();
  }
}

function runPythonHeuristic(mode) {
  const course = courseMap.get(state.codingCourseId);
  const studio = course.codingStudio;
  const code = state.codingDrafts[course.id];

  if (mode === 'run') {
    state.codingOutput =
      'Python browser mode uses guided grading in this build.\n\nExpected behavior:\nnormalize_name("  aNA  ") -> "Ana"';
    state.codingFeedback = studio.explanation;
    commit();
    return;
  }

  const results = studio.tests.map((test) => {
    const pattern = new RegExp(test.pattern, 'm');
    const passed = pattern.test(code);

    return {
      label: test.label,
      passed,
      expected: 'Pattern required',
      actual: passed ? 'Matched' : test.message
    };
  });

  const allPassed = results.every((item) => item.passed);
  state.codingTestResults = results;
  state.codingOutput = allPassed
    ? 'All grading checks passed. The function structure looks solid.'
    : 'Guided grading found a few missing pieces in the solution.';
  state.codingFeedback = allPassed
    ? 'Nice work. The solution follows the expected cleanup steps.'
    : studio.hint;

  if (allPassed) {
    state.profile.stats.codeRuns += 1;
    awardXp(30, { courseId: course.id });
    advanceCourseProgress(course.id, {
      completion: 3,
      minutes: 10,
      quizAverage: 92,
      skills: {
        Syntax: 2,
        Debugging: 2,
        'Problem solving': 2
      }
    });
    recordLearningEvent('code-practice', course.id, `Passed Python structure checks in ${course.title}.`);
    commit('Python challenge checks passed.');
    return;
  }

  commit('The grader found a few missing cues in the Python solution.');
}

function handleCodeRun(mode) {
  const course = courseMap.get(state.codingCourseId);

  if (!canAccessCourse(course)) {
    state.route = 'pricing';
    commit(`Upgrade to practice ${course.title}.`);
    return;
  }

  ensureCourseProgress(course.id).enrolled = true;

  if (course.codingStudio.runner === 'javascript') {
    runJavaScriptChallenge(mode);
    return;
  }

  runPythonHeuristic(mode);
}

function getCurrentFlashcard() {
  const course = courseMap.get(state.languageCourseId);
  const deck = course.languageStudio.flashcards;
  return deck[state.flashcardIndex % deck.length];
}

function updateReviewCard(card, courseId, rating) {
  const current = state.profile.reviewQueue[card.id] || {
    id: card.id,
    prompt: card.front,
    answer: card.back,
    pronunciation: card.pronunciation,
    courseId,
    dueOn: getTodayKey(),
    interval: 1,
    ease: 2.4
  };

  let interval = current.interval || 1;
  let ease = current.ease || 2.4;

  if (rating === 'hard') {
    interval = 1;
    ease = Math.max(1.8, ease - 0.15);
  }

  if (rating === 'good') {
    interval = Math.max(2, Math.round(interval * ease));
  }

  if (rating === 'easy') {
    ease += 0.15;
    interval = Math.max(3, Math.round(interval * (ease + 0.3)));
  }

  state.profile.reviewQueue[card.id] = {
    ...current,
    dueOn: addDays(getTodayKey(), interval),
    interval,
    ease
  };
}

function handleFlashcardReview(rating) {
  const course = courseMap.get(state.languageCourseId);

  if (!canAccessCourse(course)) {
    state.route = 'pricing';
    commit(`Unlock ${course.title} to continue language drills.`);
    return;
  }

  const card = getCurrentFlashcard();
  updateReviewCard(card, course.id, rating);
  state.profile.stats.reviewsCompleted += 1;
  awardXp(rating === 'easy' ? 18 : 12, { courseId: course.id });
  advanceCourseProgress(course.id, {
    completion: 2,
    minutes: 6,
    quizAverage: 90,
    skills: {
      Reading: 2,
      Writing: 1,
      Speaking: 2
    }
  });
  state.flashcardIndex = (state.flashcardIndex + 1) % course.languageStudio.flashcards.length;
  state.flashcardFlipped = false;
  state.practiceFeedback = `Flashcard reviewed. Next due date updated for ${card.front}.`;
  recordLearningEvent('language-review', course.id, `Reviewed flashcard ${card.front}.`);
  commit('Flashcard review logged.');
}

function handleFillBlank(answer) {
  const course = courseMap.get(state.languageCourseId);

  if (!canAccessCourse(course)) {
    state.route = 'pricing';
    commit(`Unlock ${course.title} to continue language drills.`);
    return;
  }

  const exercise = course.languageStudio.fillBlank;
  const correct = normalizeText(answer) === normalizeText(exercise.answer);
  ensureCourseProgress(course.id).enrolled = true;

  if (correct) {
    state.profile.stats.languageExercises += 1;
    awardXp(20, { courseId: course.id });
    advanceCourseProgress(course.id, {
      completion: 2,
      minutes: 7,
      quizAverage: 92,
      skills: {
        Reading: 2,
        Writing: 2,
        Speaking: 1
      }
    });
    state.practiceFeedback = `Correct. ${exercise.hint}`;
    recordLearningEvent('language-practice', course.id, `Solved fill-in-the-blank in ${course.title}.`);
    commit('Fill-in-the-blank solved.');
    return;
  }

  state.practiceFeedback = `Not quite. Hint: ${exercise.hint}`;
  commit('The blank exercise needs one more try.');
}

function handleTranslationSubmit(form) {
  const course = courseMap.get(state.languageCourseId);

  if (!canAccessCourse(course)) {
    state.route = 'pricing';
    commit(`Unlock ${course.title} to continue language drills.`);
    return;
  }

  const answer = form.get('translation_answer') || '';
  const exercise = course.languageStudio.translation;
  const normalized = normalizeText(answer);
  const accepted = exercise.acceptedAnswers.some(
    (candidate) => normalizeText(candidate) === normalized
  );
  ensureCourseProgress(course.id).enrolled = true;

  if (accepted) {
    state.profile.stats.languageExercises += 1;
    awardXp(24, { courseId: course.id });
    advanceCourseProgress(course.id, {
      completion: 3,
      minutes: 8,
      quizAverage: 94,
      skills: {
        Reading: 1,
        Writing: 3,
        Speaking: 2
      }
    });
    state.practiceFeedback = `Correct. ${exercise.explanation}`;
    recordLearningEvent('language-practice', course.id, `Completed translation practice in ${course.title}.`);
    commit('Translation exercise completed.');
    return;
  }

  state.practiceFeedback = `Try again. ${exercise.explanation}`;
  commit('The translation answer was not accepted yet.');
}

function handleDailyChallengeSubmit(form) {
  const challenge = getCurrentDailyChallenge();

  if (isDailyChallengeComplete()) {
    state.dailyChallengeFeedback = 'Today\'s challenge is already complete.';
    commit();
    return;
  }

  const answer = form.get('daily_answer') || '';
  const accepted = challenge.acceptedAnswers.some(
    (candidate) => normalizeText(candidate) === normalizeText(answer)
  );

  if (accepted) {
    state.profile.dailyChallengeHistory[getTodayKey()] = challenge.id;
    state.profile.stats.dailyChallengesCompleted += 1;
    awardXp(challenge.rewardXp);
    state.dailyChallengeFeedback = `Correct. ${challenge.explanation}`;
    commit('Daily challenge complete.');
    return;
  }

  state.dailyChallengeFeedback = `Not quite. ${challenge.explanation}`;
  commit('Daily challenge answer needs another try.');
}

function handleReviewQueue(rating) {
  const dueCards = getDueReviewCards();
  const nextCard = dueCards[0];

  if (!nextCard) {
    commit('No review cards are due right now.');
    return;
  }

  updateReviewCard(
    {
      id: nextCard.id,
      front: nextCard.prompt,
      back: nextCard.answer,
      pronunciation: nextCard.pronunciation
    },
    nextCard.courseId,
    rating
  );
  state.profile.stats.reviewsCompleted += 1;
  awardXp(rating === 'easy' ? 16 : 12, { courseId: nextCard.courseId });
  advanceCourseProgress(nextCard.courseId, {
    completion: 1,
    minutes: 4,
    skills: {
      Reading: 1,
      Writing: 1,
      Speaking: 1
    }
  });
  recordLearningEvent('spaced-review', nextCard.courseId, 'Completed a spaced repetition review.');
  commit('Spaced review updated.');
}

function handleGoalSubmit(form) {
  const goal = (form.get('goal_text') || '').trim();

  if (!goal) {
    return;
  }

  state.profile.learningGoals.unshift(goal);
  state.profile.learningGoals = state.profile.learningGoals.slice(0, 5);
  commit('Learning goal added.');
}

function handleWeeklyGoal(form) {
  const minutes = Number(form.get('weekly_goal_minutes'));

  if (!minutes || Number.isNaN(minutes)) {
    return;
  }

  state.profile.weeklyGoal = clamp(minutes, 30, 1200);
  commit('Weekly goal updated.');
}

function handleSearch(form) {
  state.catalogQuery = (form.get('catalog_query') || '').trim();
  commit();
}

function applyStartingChoice(courseId) {
  const course = courseMap.get(courseId);

  state.profile.preferences = {
    ...(state.profile.preferences || {}),
    onboardingComplete: true,
    primaryCourseId: courseId,
    preferredTrack: course.type
  };
  state.selectedCourseId = courseId;
  state.catalogFilter = course.type;
  ensureCourseProgress(courseId).enrolled = true;

  if (course.type === 'coding') {
    state.codingCourseId = courseId;
    state.practiceMode = 'coding';
  } else {
    state.languageCourseId = courseId;
    state.practiceMode = 'language';
  }

  upsertLessonSession(state.learningWorkspace, createLessonSession(course));
  upsertStudyPlan(state.learningWorkspace, buildStarterStudyPlan(course));
  recordLearningEvent('onboarding', courseId, `Selected ${course.title} as the starting learning focus.`);
  state.route = 'dashboard';
  commit(`${course.title} selected as your learning focus.`);
}

async function handleGenerateStudyPlan(focusArea = '') {
  const course = getPlanCourse();
  state.aiBusy = true;
  state.aiError = '';
  renderApp();

  try {
    const ai = await ensureAiTools();
    const plan = await ai.generateSmartStudyPlan({
      course,
      profile: state.profile,
      focusArea
    });

    upsertStudyPlan(state.learningWorkspace, {
      ...plan,
      courseId: course.id
    });
    state.learningWorkspace.aiModeLabel = ai.getAiModeLabel();
    recordLearningEvent('study-plan', course.id, `Generated a fresh study plan for ${course.title}.`);
    commit('Study plan updated.');
  } catch (error) {
    state.aiError = error.message;
    state.aiBusy = false;
    renderApp();
  } finally {
    state.aiBusy = false;
    renderApp();
  }
}

function buildPracticeContext(course) {
  if (course.type === 'coding') {
    return {
      summary: state.codingFeedback || course.codingStudio.prompt,
      codeSnippet: (state.codingDrafts[course.id] || '').slice(0, 900),
      latestOutput: state.codingOutput
    };
  }

  const card = getCurrentFlashcard();
  return {
    summary: state.practiceFeedback || course.languageStudio.translation.prompt,
    flashcard: card,
    translationPrompt: course.languageStudio.translation.prompt
  };
}

async function requestAiCoach(agentType, prompt, course = getActivePracticeCourse()) {
  state.aiBusy = true;
  state.aiError = '';
  renderApp();

  try {
    const ai = await ensureAiTools();
    const response = await ai.askSmartAgent({
      agentType,
      course,
      prompt,
      practiceContext: buildPracticeContext(course),
      profile: state.profile
    });

    const session = {
      id: `${agentType}-${Date.now()}`,
      agentType,
      courseId: course.id,
      courseTitle: course.title,
      prompt,
      response,
      createdAt: new Date().toISOString()
    };

    appendAgentSession(state.learningWorkspace, session);
    appendMentorNote(state.learningWorkspace, {
      id: `note-${Date.now()}`,
      courseId: course.id,
      text: response.savedNote,
      source: `${agentType}-${response.source}`,
      createdAt: new Date().toISOString()
    });
    state.learningWorkspace.aiModeLabel = ai.getAiModeLabel();
    recordLearningEvent('ai-session', course.id, `Used ${agentType} agent for ${course.title}.`);
    commit('AI coach responded.');
  } catch (error) {
    state.aiError = error.message;
    state.aiBusy = false;
    renderApp();
  } finally {
    state.aiBusy = false;
    renderApp();
  }
}

async function handleAiCoachSubmit(form) {
  const prompt = (form.get('agent_prompt') || '').trim();
  const agentType = form.get('agent_type') || state.aiAgentType;
  const course = getActivePracticeCourse();

  if (!prompt) {
    state.aiError = 'Add a question so the AI coach knows what to help with.';
    renderApp();
    return;
  }

  state.aiAgentType = agentType;
  await requestAiCoach(agentType, prompt, course);
}

async function handleQuickAgent(agentType) {
  const course = getActivePracticeCourse();
  const quickPrompts = {
    planner: `Create a compact study plan for my current ${course.title} progress.`,
    debugger: `Review my current ${course.title} solution and tell me the most likely next fix.`,
    language: `Coach me through my current ${course.title} exercise and improve my recall.`,
    quiz: `Explain the mistake pattern I should avoid in my current ${course.title} practice.`
  };

  state.aiAgentType = agentType;
  await requestAiCoach(agentType, quickPrompts[agentType], course);
}

async function handleCloseAiSettings() {
  const ai = await ensureAiTools();
  state.learningWorkspace.aiModeLabel = ai.getAiModeLabel();
  state.aiSettingsOpen = false;
  renderApp();
}

function handleLessonTaskComplete(courseId, taskId) {
  const course = courseMap.get(courseId);
  const session = ensureLessonSession(courseId);
  const task = session.tasks.find((item) => item.id === taskId);

  if (!task || task.status === 'done') {
    return;
  }

  task.status = 'done';
  advanceCourseProgress(courseId, {
    completion: 3,
    minutes: 10,
    quizAverage: 93,
    currentLesson: task.title,
    nextLesson: session.tasks.find((item) => item.status !== 'done')?.title || 'Great job. Regenerate a fresh mission.',
    skills:
      course.type === 'coding'
        ? {
            Syntax: 2,
            Debugging: 2,
            'Problem solving': 2
          }
        : {
            Reading: 2,
            Writing: 2,
            Speaking: 2
          }
  });
  awardXp(22, { courseId });
  upsertLessonSession(state.learningWorkspace, session);
  recordLearningEvent('lesson-step', courseId, `Completed mission step: ${task.title}.`);
  commit('Mission step completed.');
}

function handleRefreshLessonMission() {
  const course = getActivePracticeCourse();
  upsertLessonSession(state.learningWorkspace, createLessonSession(course));
  recordLearningEvent('lesson-refresh', course.id, `Refreshed guided mission for ${course.title}.`);
  commit('New guided mission ready.');
}

function handleMentorNoteSubmit(form) {
  const note = (form.get('mentor_note') || '').trim();
  const course = getActivePracticeCourse();

  if (!note) {
    return;
  }

  appendMentorNote(state.learningWorkspace, {
    id: `manual-note-${Date.now()}`,
    courseId: course.id,
    text: note,
    source: 'manual',
    createdAt: new Date().toISOString()
  });
  recordLearningEvent('mentor-note', course.id, `Saved a mentor note for ${course.title}.`);
  commit('Mentor note saved.');
}

function speakText(text, lang) {
  if (!('speechSynthesis' in window)) {
    showToast('Pronunciation audio is not supported in this browser.');
    renderApp();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}

async function handleEmailAuth(form) {
  const displayName = (form.get('display_name') || '').trim();
  const email = (form.get('email') || '').trim();
  const password = form.get('password') || '';

  state.authBusy = true;
  state.authError = '';
  renderApp();

  try {
    const backend = await ensureBackend();

    if (state.authMode === 'signup') {
      const result = await backend.signUpWithEmail({
        email,
        password,
        displayName
      });

      state.authModalOpen = false;
      state.authBusy = false;

      if (result.needsEmailConfirmation) {
        showToast('Account created. Check your email to confirm the sign-in.');
        renderApp();
        return;
      }

      showToast('Signed in successfully.');
    } else {
      await backend.signInWithEmail({
        email,
        password
      });
      state.authModalOpen = false;
      state.authBusy = false;
      showToast('Signed in successfully.');
    }
    renderApp();
  } catch (error) {
    state.authBusy = false;
    state.authError = error.message;
    renderApp();
  }
}

async function handleGoogleAuth() {
  state.authBusy = true;
  state.authError = '';
  renderApp();

  try {
    const backend = await ensureBackend();
    await backend.signInWithGoogle();
    state.authBusy = false;
    state.authModalOpen = false;
    showToast('Redirecting to Google sign-in...');
    renderApp();
  } catch (error) {
    state.authBusy = false;
    state.authError = error.message;
    renderApp();
  }
}

async function handleSignOut() {
  try {
    const backend = await ensureBackend();
    await backend.signOut();
    state.user = null;
    state.syncStatus = 'Local only';
    state.profile.authProvider = 'guest';
    state.profile.email = '';
    commit('Signed out. Local progress is still available on this device.');
  } catch (error) {
    state.authError = error.message;
    renderApp();
  }
}

async function syncFromCloud(user) {
  state.user = user;
  state.syncStatus = 'Supabase sync active';

  try {
    const backend = await ensureBackend();
    const remoteProfile = await backend.getProfile(user.id);
    if (remoteProfile) {
      state.profile = deepMerge(defaultProfile, remoteProfile);
    }

    const remoteWorkspace = await loadRemoteLearningWorkspace(backend, user.id);
    state.learningWorkspace = mergeLearningWorkspace(
      createDefaultLearningWorkspace(),
      remoteWorkspace
    );
  } catch (error) {
    console.warn('Cloud read failed', error);
    state.syncStatus = 'Supabase sync unavailable';
  }

  state.profile.name = getAuthDisplayName(user);
  state.profile.email = user.email || '';
  state.profile.authProvider = getAuthProvider(user);

  touchDailyActivity();
  seedCodingDrafts();
  seedReviewQueue();
  syncBadges();
  bootstrapLearningWorkspace();
  saveLocalState();
  renderApp();
}

function subscribeToAuth() {
  ensureBackend()
    .then(async (backend) => {
      if (!backend.isSupabaseConfigured()) {
        state.syncStatus = 'Local only';
        renderApp();
        return;
      }

      const currentUser = await backend.getCurrentUser();
      if (currentUser) {
        await syncFromCloud(currentUser);
      } else {
        state.user = null;
        state.syncStatus = 'Local only';
        renderApp();
      }

      backend.subscribeToAuthChanges(async (user) => {
        if (!user) {
          state.user = null;
          state.syncStatus = 'Local only';
          renderApp();
          return;
        }

        await syncFromCloud(user);
      });
    })
    .catch((error) => {
      console.warn('Auth subscription failed', error);
      state.syncStatus = 'Local only';
      renderApp();
    });
}

function renderNavButton(route, label) {
  const active = getNavKey(state.route) === route ? 'is-active' : '';
  return `
    <button class="nav-link ${active}" data-action="navigate" data-route="${route}">
      <span class="nav-link__dot"></span>
      <span>${label}</span>
    </button>
  `;
}

function renderTopBar() {
  const recommended = getRecommendedCourse();
  const subtitle =
    state.route === 'dashboard'
      ? `Do one short lesson in ${recommended.language} and keep the streak alive.`
      : `Focused on ${recommended.title}.`;

  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">CodeQuest AI</p>
        <h1>${escapeHtml(getRouteTitle())}</h1>
        <p class="topbar__subtitle">${escapeHtml(subtitle)}</p>
      </div>
      <div class="topbar__actions">
        <div class="topbar-chip topbar-chip--streak">
          <strong>${state.profile.streak}</strong>
          <span>day streak</span>
        </div>
        <div class="topbar-chip topbar-chip--xp">
          <strong>${state.profile.xp}</strong>
          <span>xp</span>
        </div>
        <div class="sync-pill">${escapeHtml(state.syncStatus)}</div>
        <button class="profile-pill" data-action="navigate" data-route="profile">
          <span class="profile-pill__avatar">${escapeHtml(getInitials(state.profile.name))}</span>
          <span>${escapeHtml(state.user ? state.profile.name : 'Guest mode')}</span>
        </button>
      </div>
    </header>
  `;
}

function renderSidebar() {
  const recommended = getRecommendedCourse();

  return `
    <aside class="sidebar">
      <div class="brand-card">
        <div class="brand-mark">CQ</div>
        <div>
          <h2>CodeQuest AI</h2>
          <p>Small lessons, daily streaks, and simple practice.</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${renderNavButton('dashboard', 'Learn')}
        ${renderNavButton('courses', 'Paths')}
        ${renderNavButton('practice', 'Practice')}
        ${renderNavButton('community', 'Friends')}
        ${renderNavButton('profile', 'Profile')}
      </nav>

      <section class="sidebar-focus">
        <p class="eyebrow">Today</p>
        <h3>${escapeHtml(recommended.language)}</h3>
        <p>${escapeHtml(ensureCourseProgress(recommended.id).currentLesson)}</p>
        <button class="button button--secondary" data-action="start-course" data-course-id="${recommended.id}">
          Start lesson
        </button>
      </section>
    </aside>
  `;
}

function renderMobileNav() {
  const tabs = [
    ['dashboard', 'Learn'],
    ['courses', 'Paths'],
    ['practice', 'Practice'],
    ['community', 'Friends'],
    ['profile', 'Profile']
  ];

  return `
    <nav class="mobile-nav">
      ${tabs
        .map(([route, label]) => {
          const active = getNavKey(state.route) === route ? 'is-active' : '';
          return `<button class="${active}" data-action="navigate" data-route="${route}">${label}</button>`;
        })
        .join('')}
    </nav>
  `;
}

function renderStatCard(label, value, detail) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

function renderProgressBars(skills) {
  return Object.entries(skills)
    .map(
      ([label, value]) => `
        <div class="skill-row">
          <div class="skill-row__meta">
            <span>${escapeHtml(label)}</span>
            <strong>${value}%</strong>
          </div>
          <div class="progress-track"><span style="width:${value}%"></span></div>
        </div>
      `
    )
    .join('');
}

function renderEnrolledCourseCards() {
  return Object.entries(state.profile.courseProgress)
    .filter(([, progress]) => progress.enrolled)
    .map(([courseId, progress]) => {
      const course = courseMap.get(courseId);
      return `
        <article class="course-progress-card">
          <div class="course-progress-card__header">
            <div>
              <p class="eyebrow">${escapeHtml(course.type)}</p>
              <h3>${escapeHtml(course.title)}</h3>
            </div>
            <button class="link-button" data-action="view-course" data-course-id="${course.id}">
              View path
            </button>
          </div>
          <p>${escapeHtml(progress.currentLesson)}</p>
          <div class="progress-track"><span style="width:${progress.completion}%"></span></div>
          <div class="card-metrics">
            <span>${progress.completion}% complete</span>
            <span>${progress.quizAverage}% quiz average</span>
            <span>${progress.timeSpent} min logged</span>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderLeaderboard() {
  return `
    <div class="leaderboard-list">
      ${leaderboard
        .map((entry, index) => {
          const isYou = entry.name === 'You';
          const xp = isYou ? state.profile.xp : entry.xp;
          const streak = isYou ? state.profile.streak : entry.streak;
          return `
            <div class="leaderboard-row ${isYou ? 'is-highlighted' : ''}">
              <span>#${index + 1}</span>
              <div>
                <strong>${escapeHtml(isYou ? state.profile.name || 'You' : entry.name)}</strong>
                <p>${escapeHtml(entry.focus)}</p>
              </div>
              <div class="leaderboard-row__metrics">
                <strong>${xp} XP</strong>
                <span>${streak} day streak</span>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderReviewPreview() {
  const dueCards = getDueReviewCards();

  if (!dueCards.length) {
    return `
      <div class="empty-state">
        <h3>No cards due right now</h3>
        <p>Your spaced repetition queue is under control. Come back tomorrow for the next batch.</p>
      </div>
    `;
  }

  return `
    <div class="review-preview-list">
      ${dueCards
        .slice(0, 3)
        .map((card) => {
          const course = courseMap.get(card.courseId);
          return `
            <article class="review-preview-card">
              <div>
                <strong>${escapeHtml(card.prompt)}</strong>
                <p>${escapeHtml(card.answer)}</p>
              </div>
              <div class="review-preview-card__meta">
                <span>${escapeHtml(course.title)}</span>
                <span>Due today</span>
              </div>
            </article>
          `;
        })
        .join('')}
      <button class="button button--secondary" data-action="switch-practice" data-mode="review">
        Open review queue
      </button>
    </div>
  `;
}

function renderStudyPlanSurface() {
  const plan = state.learningWorkspace.studyPlan;
  const course = plan ? courseMap.get(plan.courseId) : getPlanCourse();

  if (!plan) {
    return `
      <article class="surface surface--wide">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Today's plan</p>
            <h3>Build a short study plan</h3>
          </div>
        </div>
        <p>Create a simple plan based on your current lesson and goals.</p>
        <button class="button" data-action="generate-study-plan">Generate plan</button>
      </article>
    `;
  }

  return `
    <article class="surface surface--wide">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Today's plan</p>
          <h3>${escapeHtml(plan.headline)}</h3>
        </div>
        <div class="card-actions">
          <span class="status-pill">${escapeHtml(getAiModeLabel())}</span>
          <button class="button button--secondary" data-action="generate-study-plan">
            ${state.aiBusy ? 'Refreshing...' : 'Refresh plan'}
          </button>
        </div>
      </div>
      <p>${escapeHtml(plan.rationale)}</p>
      <div class="plan-list">
        ${(plan.tasks || [])
          .map(
            (task) => `
              <article class="plan-task">
                <div>
                  <strong>${escapeHtml(task.title)}</strong>
                  <p>${escapeHtml(task.instruction)}</p>
                </div>
                <div class="plan-task__meta">
                  <span>${escapeHtml(task.type)}</span>
                  <span>${escapeHtml(task.duration)}</span>
                </div>
              </article>
            `
          )
          .join('')}
      </div>
      <p class="helper-text">
        Focus: ${escapeHtml(plan.focusArea)}. Coach tip: ${escapeHtml(plan.coachTip)}
      </p>
    </article>
  `;
}

function renderWelcomeOption(course) {
  return `
    <button class="focus-option" data-action="choose-start-course" data-course-id="${course.id}">
      <div class="focus-option__header">
        <div>
          <p class="eyebrow">${escapeHtml(course.type === 'coding' ? 'Coding language' : 'Spoken language')}</p>
          <h3>${escapeHtml(course.language)}</h3>
        </div>
        <span class="pill">${escapeHtml(course.track)}</span>
      </div>
      <p>${escapeHtml(course.title)}</p>
      <div class="focus-option__meta">
        <span>${course.lessons} lessons</span>
        <span>${course.quizzes} quizzes</span>
        <span>${escapeHtml(course.duration)}</span>
      </div>
      <div class="focus-option__footer">
        <span>Short daily lessons</span>
        <strong>Choose this path</strong>
      </div>
    </button>
  `;
}

function renderWelcomePage() {
  const spokenCourses = getCourseTypeCourses('language');
  const codingCourses = getCourseTypeCourses('coding');

  return `
    <div class="welcome-shell">
      <section class="welcome-panel">
        <div class="welcome-topbar">
          <div>
            <p class="eyebrow">CodeQuest AI</p>
            <h1>Pick one place to start</h1>
          </div>
          <div class="card-actions">
            ${
              state.user
                ? `<span class="sync-pill">Signed in as ${escapeHtml(state.profile.name)}</span>`
                : `<button class="button button--ghost" data-action="open-auth">Sign up / Login</button>`
            }
          </div>
        </div>

        <div class="welcome-copy">
          <p>
            Pick one path first. We will keep the lessons short, playful, and easy to follow.
          </p>
          <div class="welcome-badges">
            <span class="duo-badge">Daily streaks</span>
            <span class="duo-badge">Short lessons</span>
            <span class="duo-badge">AI help when stuck</span>
          </div>
        </div>

        <div class="welcome-grid">
          <article class="surface welcome-column">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Spoken languages</p>
                <h2>Learn to speak with confidence</h2>
              </div>
            </div>
            <div class="focus-option-list">
              ${spokenCourses.map((course) => renderWelcomeOption(course)).join('')}
            </div>
          </article>

          <article class="surface welcome-column">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Coding languages</p>
                <h2>Learn to build real projects</h2>
              </div>
            </div>
            <div class="focus-option-list">
              ${codingCourses.map((course) => renderWelcomeOption(course)).join('')}
            </div>
          </article>
        </div>
      </section>
    </div>
  `;
}

function renderActivityFeedSurface() {
  const events = state.learningWorkspace.activityFeed || [];
  const notes = state.learningWorkspace.mentorNotes || [];

  return `
    <article class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Recent wins</p>
          <h3>What you worked on lately</h3>
        </div>
      </div>
      <div class="activity-feed">
        ${
          events.length
            ? events
                .slice(0, 5)
                .map(
                  (event) => `
                    <div class="activity-item">
                      <strong>${escapeHtml(event.message)}</strong>
                      <span>${escapeHtml((event.createdAt || '').slice(0, 10) || 'recently')}</span>
                    </div>
                  `
                )
                .join('')
            : '<p>No learning events saved yet. Practice actions and AI sessions will appear here.</p>'
        }
      </div>
      <div class="note-list">
        ${
          notes.length
            ? notes
                .slice(0, 3)
                .map(
                  (note) => `
                    <article class="note-card">
                      <p>${escapeHtml(note.text)}</p>
                      <span>${escapeHtml(note.source)} • ${escapeHtml((note.createdAt || '').slice(0, 10) || 'recently')}</span>
                    </article>
                  `
                )
                .join('')
            : '<p class="helper-text">Your saved notes and AI takeaways will show up here.</p>'
        }
      </div>
    </article>
  `;
}

function renderLessonMission() {
  const course = getActivePracticeCourse();
  const session = ensureLessonSession(course.id);
  const allDone = session.tasks.every((task) => task.status === 'done');

  return `
    <section class="surface lesson-mission">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Guided lesson mission</p>
          <h3>${escapeHtml(session.title)}</h3>
        </div>
        <div class="card-actions">
          <span class="status-pill">${allDone ? 'Completed' : 'In progress'}</span>
          <button class="button button--secondary" data-action="refresh-lesson">
            New mission
          </button>
        </div>
      </div>
      <p>${escapeHtml(session.summary)}</p>
      <div class="mission-steps">
        ${session.tasks
          .map(
            (task) => `
              <article class="mission-step ${task.status === 'done' ? 'is-done' : ''}">
                <div>
                  <strong>${escapeHtml(task.title)}</strong>
                  <p>${escapeHtml(task.description)}</p>
                </div>
                <button
                  class="button ${task.status === 'done' ? 'button--ghost' : ''}"
                  data-action="complete-lesson-step"
                  data-course-id="${course.id}"
                  data-task-id="${task.id}"
                  ${task.status === 'done' ? 'disabled' : ''}
                >
                  ${task.status === 'done' ? 'Done' : 'Complete step'}
                </button>
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderAiCoachSurface({ compact = false } = {}) {
  const sessions = state.learningWorkspace.agentSessions || [];
  const latestSession = sessions[0];
  const title = compact
    ? 'Need a quick hint?'
    : 'Smart agents for planning, debugging, language help, and quiz support';
  const aiModeLabel = getAiModeLabel();
  const bannerText =
    aiModeLabel === 'Local coach'
      ? 'Local coach mode is active. Add a server-side Gemini or OpenAI key to enable hosted AI help.'
      : `${aiModeLabel} is active for deeper responses.`;
  const quickActions = compact
    ? `
      <div class="card-actions">
        <button class="button button--secondary" data-action="quick-ai" data-agent="planner">
          Make plan
        </button>
        <button class="button button--secondary" data-action="quick-ai" data-agent="debugger">
          Get help
        </button>
      </div>
    `
    : `
      <div class="card-actions">
        <button class="button button--secondary" data-action="quick-ai" data-agent="planner">
          Build plan
        </button>
        <button class="button button--secondary" data-action="quick-ai" data-agent="debugger">
          Debug help
        </button>
        <button class="button button--secondary" data-action="quick-ai" data-agent="language">
          Language help
        </button>
        <button class="button button--secondary" data-action="quick-ai" data-agent="quiz">
          Explain mistake
        </button>
      </div>
    `;
  const coachForm = compact
    ? `
      <form class="stack-form stack-form--inline" data-form="ai-coach-form">
        <input type="hidden" name="agent_type" value="${escapeHtml(state.aiAgentType)}" />
        <input
          name="agent_prompt"
          type="text"
          placeholder="Ask for the next step, a quick explanation, or help with a mistake..."
        />
        <button class="button" type="submit" ${state.aiBusy ? 'disabled' : ''}>
          ${state.aiBusy ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>
    `
    : `
      <form class="stack-form" data-form="ai-coach-form">
        <select class="select-control" name="agent_type">
          <option value="planner" ${state.aiAgentType === 'planner' ? 'selected' : ''}>Study planner</option>
          <option value="debugger" ${state.aiAgentType === 'debugger' ? 'selected' : ''}>Code debugger</option>
          <option value="language" ${state.aiAgentType === 'language' ? 'selected' : ''}>Language coach</option>
          <option value="quiz" ${state.aiAgentType === 'quiz' ? 'selected' : ''}>Quiz explainer</option>
        </select>
        <input
          name="agent_prompt"
          type="text"
          placeholder="Ask anything: explain my bug, build a plan, improve my pronunciation..."
        />
        <button class="button" type="submit" ${state.aiBusy ? 'disabled' : ''}>
          ${state.aiBusy ? 'Thinking...' : 'Ask AI coach'}
        </button>
      </form>
    `;

  return `
    <section class="surface ai-coach-surface ${compact ? 'ai-coach-surface--compact' : ''}">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI learning coach</p>
          <h3>${title}</h3>
        </div>
        <div class="card-actions">
          <span class="status-pill">${escapeHtml(aiModeLabel)}</span>
          ${compact ? '' : '<button class="button button--ghost" data-action="open-ai-settings">AI settings</button>'}
        </div>
      </div>

      <div class="ai-banner ${compact ? 'ai-banner--compact' : ''}">
        <p>${escapeHtml(bannerText)}</p>
        ${quickActions}
      </div>

      ${coachForm}

      ${
        state.aiError ? `<p class="feedback-note feedback-note--error">${escapeHtml(state.aiError)}</p>` : ''
      }

      ${
        latestSession
          ? `
            <article class="agent-response-card">
              <p class="eyebrow">${escapeHtml(latestSession.agentType)} • ${escapeHtml(latestSession.courseTitle)}</p>
              <h4>${escapeHtml(latestSession.response?.title || 'AI coach response')}</h4>
              <p>${escapeHtml(latestSession.response?.summary || '')}</p>
              <ul class="feature-list">
                ${(latestSession.response?.bullets || [])
                  .map((item) => `<li>${escapeHtml(item)}</li>`)
                  .join('')}
              </ul>
              <div class="next-step-list">
                ${(latestSession.response?.nextSteps || [])
                  .map((step) => `<span class="timeline-chip">${escapeHtml(step)}</span>`)
                  .join('')}
              </div>
            </article>
          `
          : '<p class="helper-text">Your recent AI sessions will appear here.</p>'
      }

      ${
        compact
          ? ''
          : `
            <form class="stack-form" data-form="mentor-note-form">
              <input name="mentor_note" type="text" placeholder="Save a manual mentor note for later..." />
              <button class="button button--ghost" type="submit">Save note</button>
            </form>
          `
      }
    </section>
  `;
}

function getCurrentModule(course, progress) {
  return course.modules.find((module) => module.stage === progress.pathStage) || course.modules[0];
}

function renderLessonPathSurface(course, progress) {
  const activeModule = getCurrentModule(course, progress);
  const lessons = activeModule?.lessons || [];
  const currentIndex = clamp(
    Math.round((progress.completion / 100) * Math.max(lessons.length - 1, 0)),
    0,
    Math.max(lessons.length - 1, 0)
  );

  return `
    <article class="surface surface--wide duo-path-surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Unit</p>
          <h3>${escapeHtml(activeModule.title)}</h3>
        </div>
        <button class="button button--secondary" data-action="start-course" data-course-id="${course.id}">
          Open lesson
        </button>
      </div>
      <div class="unit-banner">
        <div>
          <strong>${escapeHtml(course.title)}</strong>
          <p>${escapeHtml(activeModule.description)}</p>
        </div>
        <span class="duo-badge">${progress.completion}% complete</span>
      </div>
      <div class="lesson-trail">
        ${lessons
          .map((lesson, index) => {
            const status =
              index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'locked';
            const statusLabel =
              status === 'done' ? 'Complete' : status === 'current' ? 'Start here' : 'Coming up';
            const sideClass = index % 2 === 0 ? 'is-left' : 'is-right';

            return `
              <article class="trail-row ${sideClass}">
                <button
                  class="trail-node trail-node--${status}"
                  data-action="start-course"
                  data-course-id="${course.id}"
                >
                  <span class="trail-node__number">${index + 1}</span>
                </button>
                <div class="trail-card">
                  <p class="eyebrow">Lesson ${index + 1}</p>
                  <strong>${escapeHtml(lesson)}</strong>
                  <span>${statusLabel}</span>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
      <div class="duo-path-footer">
        <span class="duo-badge">Stage: ${escapeHtml(activeModule.stage)}</span>
        <span class="duo-badge">Quiz: ${escapeHtml(activeModule.quiz)}</span>
      </div>
    </article>
  `;
}

function renderDashboard() {
  const recommended = getRecommendedCourse();
  const recommendedProgress = ensureCourseProgress(recommended.id);
  const weeklyGoalPercent = clamp(
    Math.round((state.profile.weeklyMinutes / state.profile.weeklyGoal) * 100),
    0,
  100
  );
  const dailyChallenge = getCurrentDailyChallenge();
  const dueCards = getDueReviewCards();
  const currentModule = getCurrentModule(recommended, recommendedProgress);

  return `
    <section class="hero-panel hero-panel--simple hero-panel--duo">
      <div class="hero-panel__copy">
        <p class="eyebrow">Today</p>
        <h2>${escapeHtml(recommended.language)} is ready for your next lesson.</h2>
        <p>
          Do one short session, earn XP, and let the app guide the next step for you.
        </p>
        <div class="hero-panel__actions">
          <button class="button" data-action="start-course" data-course-id="${recommended.id}">
            Start next lesson
          </button>
          <button class="button button--ghost" data-action="navigate" data-route="courses">
            Explore courses
          </button>
        </div>
        <div class="hero-strip">
          <span class="duo-badge">Streak ${state.profile.streak}</span>
          <span class="duo-badge">Level ${getLevelFromXp(state.profile.xp)}</span>
          <span class="duo-badge">${dueCards.length} reviews due</span>
        </div>
      </div>
      <div class="hero-panel__stats">
        <div class="spotlight-card">
          <span>Current unit</span>
          <strong>${escapeHtml(currentModule.title)}</strong>
          <p>${escapeHtml(recommendedProgress.currentLesson)}</p>
        </div>
        <div class="spotlight-card">
          <span>Weekly goal</span>
          <strong>${state.profile.weeklyMinutes} / ${state.profile.weeklyGoal} min</strong>
          <div class="progress-track"><span style="width:${weeklyGoalPercent}%"></span></div>
          <p>${weeklyGoalPercent}% of this week's target completed.</p>
        </div>
      </div>
    </section>

    <section class="duo-dashboard-grid">
      ${renderLessonPathSurface(recommended, recommendedProgress)}

      <div class="duo-dashboard-side">
        <article class="surface surface--quest">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Daily quest</p>
              <h3>${escapeHtml(dailyChallenge.title)}</h3>
            </div>
          </div>
          <p>${escapeHtml(dailyChallenge.prompt)}</p>
          ${
            isDailyChallengeComplete()
              ? `<div class="success-note">Completed today. Reward claimed.</div>`
              : `
                <form class="stack-form" data-form="daily-challenge-form">
                  <input name="daily_answer" type="text" placeholder="Type your answer" />
                  <button class="button" type="submit">Check answer</button>
                </form>
              `
          }
          ${
            state.dailyChallengeFeedback
              ? `<p class="feedback-note">${escapeHtml(state.dailyChallengeFeedback)}</p>`
              : ''
          }
        </article>

        <article class="surface surface--compact duo-mini-surface">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Quick stats</p>
              <h3>Keep the streak going</h3>
            </div>
          </div>
          <div class="duo-mini-grid">
            ${renderStatCard('Streak', `${state.profile.streak}`, 'days')}
            ${renderStatCard('XP', `${state.profile.xp}`, `level ${getLevelFromXp(state.profile.xp)}`)}
            ${renderStatCard('Reviews', `${dueCards.length}`, dueCards.length ? 'due now' : 'all clear')}
          </div>
        </article>

        ${renderAiCoachSurface({ compact: true })}
      </div>
    </section>

    <section class="page-grid duo-summary-grid">
      ${renderStudyPlanSurface()}
      ${renderActivityFeedSurface()}
    </section>
  `;
}

function renderCourseAction(course) {
  const progress = ensureCourseProgress(course.id);

  if (!PAYMENTS_ENABLED) {
    return `
      <button class="button" data-action="enroll-course" data-course-id="${course.id}">
        ${progress.enrolled ? 'Continue' : 'Start course'}
      </button>
    `;
  }

  if (progress.enrolled) {
    return `
      <button class="button" data-action="start-course" data-course-id="${course.id}">
        Continue
      </button>
    `;
  }

  if (course.access === 'purchase' && !canAccessCourse(course)) {
    return `
      <button class="button" data-action="purchase-course" data-course-id="${course.id}">
        Buy ${escapeHtml(course.priceLabel)}
      </button>
    `;
  }

  if (!canAccessCourse(course)) {
    return `
      <button class="button" data-action="navigate" data-route="pricing">
        Upgrade for access
      </button>
    `;
  }

  return `
    <button class="button" data-action="enroll-course" data-course-id="${course.id}">
      Enroll now
    </button>
  `;
}

function renderCourseCards() {
  return courseCatalog
    .filter((course) => {
      const matchesFilter = state.catalogFilter === 'all' || course.type === state.catalogFilter;
      const query = normalizeText(state.catalogQuery);
      const searchable = normalizeText(
        `${course.title} ${course.subtitle} ${course.language} ${course.type}`
      );
      const matchesQuery = !query || searchable.includes(query);
      return matchesFilter && matchesQuery;
    })
    .map((course) => {
      const progress = ensureCourseProgress(course.id);
      const activeModule = getCurrentModule(course, progress);
      return `
        <article class="course-card course-card--path">
          <div class="course-card__header">
            <div>
              <p class="eyebrow">${escapeHtml(course.language)} • ${escapeHtml(course.track)}</p>
              <h3>${escapeHtml(course.title)}</h3>
            </div>
            <span class="pill">${escapeHtml(getCourseAccessLabel(course))}</span>
          </div>
          <p>${escapeHtml(course.subtitle)}</p>
          <div class="course-card__stage">
            <span class="duo-badge">${escapeHtml(activeModule.stage)}</span>
            <span>${escapeHtml(activeModule.title)}</span>
          </div>
          <div class="course-card__meta">
            <span>${course.lessons} lessons</span>
            <span>${course.quizzes} quizzes</span>
            <span>${escapeHtml(course.duration)}</span>
          </div>
          <div class="progress-track"><span style="width:${progress.completion}%"></span></div>
          <div class="card-metrics">
            <span>${progress.completion}% complete</span>
            <span>${course.members}</span>
            <span>${course.rating} rating</span>
          </div>
          <div class="card-actions">
            <button class="button button--ghost" data-action="view-course" data-course-id="${course.id}">
              View path
            </button>
            ${renderCourseAction(course)}
          </div>
        </article>
      `;
    })
    .join('');
}

function renderCourses() {
  return `
    <section class="hero-panel hero-panel--compact hero-panel--duo">
      <div class="hero-panel__copy">
        <p class="eyebrow">Courses</p>
        <h2>Pick a path and keep the lessons easy to follow.</h2>
        <p>Choose coding or spoken languages, then move one lesson at a time.</p>
      </div>
      <div class="hero-panel__stats">
        <div class="spotlight-card">
          <span>Tracks</span>
          <strong>${courseCatalog.length}</strong>
          <p>Coding and language paths ready to start.</p>
        </div>
      </div>
    </section>

    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Course catalog</p>
          <h3>Find your next path</h3>
        </div>
      </div>

      <div class="catalog-toolbar">
        <form class="search-form" data-form="catalog-search-form">
          <input name="catalog_query" type="search" value="${escapeHtml(
            state.catalogQuery
          )}" placeholder="Search Python, Spanish, JavaScript..." />
          <button class="button button--secondary" type="submit">Search</button>
        </form>
        <div class="filter-group">
          <button
            class="filter-chip ${state.catalogFilter === 'all' ? 'is-active' : ''}"
            data-action="set-filter"
            data-filter="all"
          >
            All
          </button>
          <button
            class="filter-chip ${state.catalogFilter === 'coding' ? 'is-active' : ''}"
            data-action="set-filter"
            data-filter="coding"
          >
            Coding
          </button>
          <button
            class="filter-chip ${state.catalogFilter === 'language' ? 'is-active' : ''}"
            data-action="set-filter"
            data-filter="language"
          >
            Languages
          </button>
        </div>
      </div>
    </section>

    <section class="course-grid">
      ${renderCourseCards()}
    </section>
  `;
}

function renderCourseDetail() {
  const course = courseMap.get(state.selectedCourseId);
  const progress = ensureCourseProgress(course.id);
  const access = canAccessCourse(course);
  const activeModule = getCurrentModule(course, progress);

  return `
    <section class="hero-panel hero-panel--compact hero-panel--duo">
      <div class="hero-panel__copy">
        <p class="eyebrow">${escapeHtml(course.language)} • ${escapeHtml(course.track)}</p>
        <h2>${escapeHtml(course.title)}</h2>
        <p>${escapeHtml(course.subtitle)}</p>
        <div class="hero-panel__actions">
          ${
            access
              ? `<button class="button" data-action="start-course" data-course-id="${course.id}">
                  ${progress.enrolled ? 'Open practice' : 'Start path'}
                </button>`
              : ''
          }
          <button class="button button--ghost" data-action="navigate" data-route="courses">
            Back to catalog
          </button>
        </div>
      </div>
      <div class="hero-panel__stats">
        <div class="spotlight-card">
          <span>Current unit</span>
          <strong>${escapeHtml(activeModule.title)}</strong>
          <p>${escapeHtml(progress.currentLesson)}</p>
        </div>
        <div class="spotlight-card">
          <span>Progress</span>
          <strong>${progress.completion}% complete</strong>
          <div class="progress-track"><span style="width:${progress.completion}%"></span></div>
          <p>${progress.quizAverage}% quiz average and ${progress.timeSpent} min logged</p>
        </div>
      </div>
    </section>

    <section class="page-grid">
      <article class="surface surface--wide">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Course path</p>
            <h3>One unit at a time</h3>
          </div>
        </div>
        <div class="module-path-list">
          ${course.modules
            .map(
              (module, index) => `
                <article class="module-path-card ${module.stage === progress.pathStage ? 'is-current' : ''}">
                  <div class="module-path-card__header">
                    <div class="module-path-card__badge">Unit ${index + 1}</div>
                    <span class="pill">${escapeHtml(module.stage)}</span>
                  </div>
                  <h4>${escapeHtml(module.title)}</h4>
                  <p>${escapeHtml(module.description)}</p>
                  <div class="timeline-lessons">
                    ${module.lessons
                      .map((lesson) => `<span class="timeline-chip">${escapeHtml(lesson)}</span>`)
                      .join('')}
                  </div>
                  <p class="timeline-quiz">Quiz: ${escapeHtml(module.quiz)}</p>
                </article>
              `
            )
            .join('')}
        </div>
      </article>

      <article class="surface">
        <div class="section-heading">
          <div>
            <p class="eyebrow">${PAYMENTS_ENABLED ? 'Access' : 'Availability'}</p>
            <h3>${escapeHtml(PAYMENTS_ENABLED ? course.priceLabel : 'Included in preview')}</h3>
          </div>
        </div>
        <p>${escapeHtml(PAYMENTS_ENABLED ? course.heroMetric : 'This path is fully available while we focus on learning quality instead of billing flows.')}</p>
        <ul class="feature-list">
          ${course.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join('')}
        </ul>
        <div class="stack-actions">
          ${renderCourseAction(course)}
          ${
            access
              ? `<button class="button button--ghost" data-action="start-course" data-course-id="${course.id}">
                  Practice now
                </button>`
              : ''
          }
        </div>
      </article>
    </section>
  `;
}

function renderCodingLab() {
  const course = courseMap.get(state.codingCourseId);
  const studio = course.codingStudio;

  if (!canAccessCourse(course)) {
    return `
      <section class="surface">
        <div class="locked-state">
          <p class="eyebrow">Locked lab</p>
          <h3>${escapeHtml(course.title)} requires ${escapeHtml(course.priceLabel)}</h3>
          <p>Upgrade to Pro or unlock the course to use this coding studio.</p>
          <button class="button" data-action="navigate" data-route="pricing">View pricing</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Coding practice</p>
          <h3>${escapeHtml(course.title)}</h3>
        </div>
        <select class="select-control" data-select="coding-course">
          ${getCourseTypeCourses('coding')
            .map(
              (item) => `
                <option value="${item.id}" ${item.id === course.id ? 'selected' : ''}>
                  ${escapeHtml(item.title)}
                </option>
              `
            )
            .join('')}
        </select>
      </div>

      <div class="lab-grid">
        <article class="editor-card">
          <div class="editor-card__top">
            <span class="editor-dots"><i></i><i></i><i></i></span>
            <strong>${escapeHtml(studio.title)}</strong>
          </div>
          <textarea
            id="code-editor"
            class="code-editor"
            data-input="code-editor"
            spellcheck="false"
          >${escapeHtml(state.codingDrafts[course.id])}</textarea>
          <div class="card-actions">
            <button class="button button--secondary" data-action="run-code" data-mode="run">
              Run code
            </button>
            <button class="button" data-action="run-code" data-mode="test">Run tests</button>
            <button class="button button--ghost" data-action="quick-ai" data-agent="debugger">
              Ask debug mentor
            </button>
            <button class="button button--ghost" data-action="reset-code">Reset</button>
          </div>
        </article>

        <article class="surface-subcard">
          <p class="eyebrow">Challenge brief</p>
          <h4>${escapeHtml(studio.prompt)}</h4>
          <p>${escapeHtml(studio.hint)}</p>
          <div class="output-block">
            <strong>Output</strong>
            <pre>${escapeHtml(state.codingOutput)}</pre>
          </div>
          ${
            state.codingFeedback
              ? `<p class="feedback-note">${escapeHtml(state.codingFeedback)}</p>`
              : ''
          }
          <div class="test-list">
            ${state.codingTestResults
              .map(
                (result) => `
                  <div class="test-row ${result.passed ? 'is-passed' : 'is-failed'}">
                    <div>
                      <strong>${escapeHtml(result.label)}</strong>
                      <p>Expected: ${escapeHtml(result.expected)}</p>
                    </div>
                    <span>${result.passed ? 'Pass' : `Got: ${escapeHtml(result.actual)}`}</span>
                  </div>
                `
              )
              .join('')}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderLanguageLab() {
  const course = courseMap.get(state.languageCourseId);

  if (!canAccessCourse(course)) {
    return `
      <section class="surface">
        <div class="locked-state">
          <p class="eyebrow">Locked lab</p>
          <h3>${escapeHtml(course.title)} requires ${escapeHtml(course.priceLabel)}</h3>
          <p>Unlock this language path to use flashcards, pronunciation audio, and translation drills.</p>
          <button class="button" data-action="navigate" data-route="pricing">View pricing</button>
        </div>
      </section>
    `;
  }

  const studio = course.languageStudio;
  const card = getCurrentFlashcard();
  const blank = studio.fillBlank;
  const translation = studio.translation;

  return `
    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Language practice</p>
          <h3>${escapeHtml(course.title)}</h3>
        </div>
        <select class="select-control" data-select="language-course">
          ${getCourseTypeCourses('language')
            .map(
              (item) => `
                <option value="${item.id}" ${item.id === course.id ? 'selected' : ''}>
                  ${escapeHtml(item.title)}
                </option>
              `
            )
            .join('')}
        </select>
      </div>

      <div class="language-grid">
        <article class="surface-subcard flashcard-card">
          <div class="section-heading section-heading--tight">
            <div>
              <p class="eyebrow">Flashcards</p>
              <h4>${escapeHtml(card.front)}</h4>
            </div>
            <button class="link-button" data-action="speak-card">Play audio</button>
          </div>
          <p class="flashcard-answer ${state.flashcardFlipped ? 'is-visible' : ''}">
            ${state.flashcardFlipped ? escapeHtml(card.back) : 'Tap flip to reveal'}
          </p>
          <p class="helper-text">Pronunciation: ${escapeHtml(card.pronunciation)}</p>
          <div class="card-actions">
            <button class="button button--secondary" data-action="flip-card">
              ${state.flashcardFlipped ? 'Hide answer' : 'Flip card'}
            </button>
            <button class="button button--ghost" data-action="quick-ai" data-agent="language">
              Ask coach
            </button>
            <button class="button button--ghost" data-action="rate-card" data-rating="hard">Hard</button>
            <button class="button button--ghost" data-action="rate-card" data-rating="good">Good</button>
            <button class="button button--ghost" data-action="rate-card" data-rating="easy">Easy</button>
          </div>
        </article>

        <article class="surface-subcard">
          <p class="eyebrow">Fill in the blank</p>
          <h4>${escapeHtml(blank.sentence)}</h4>
          <div class="choice-row">
            ${blank.options
              .map(
                (option) => `
                  <button class="choice-chip" data-action="submit-fill-blank" data-value="${escapeHtml(
                    option
                  )}">
                    ${escapeHtml(option)}
                  </button>
                `
              )
              .join('')}
          </div>
          <p class="helper-text">${escapeHtml(blank.hint)}</p>
        </article>

        <article class="surface-subcard">
          <p class="eyebrow">Translation exercise</p>
          <h4>${escapeHtml(translation.prompt)}</h4>
          <form class="stack-form" data-form="translation-form">
            <input name="translation_answer" type="text" placeholder="Type your translation" />
            <div class="card-actions">
              <button class="button" type="submit">Check answer</button>
              <button class="button button--ghost" type="button" data-action="quick-ai" data-agent="quiz">
                Explain with AI
              </button>
            </div>
          </form>
        </article>
      </div>

      ${
        state.practiceFeedback
          ? `<p class="feedback-note">${escapeHtml(state.practiceFeedback)}</p>`
          : ''
      }
    </section>
  `;
}

function renderReviewLab() {
  const dueCards = getDueReviewCards();

  if (!dueCards.length) {
    return `
      <section class="surface">
        <div class="empty-state">
          <h3>Review queue clear</h3>
          <p>Your spaced repetition system does not have any due cards right now.</p>
        </div>
      </section>
    `;
  }

  const nextCard = dueCards[0];
  const course = courseMap.get(nextCard.courseId);

  return `
    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Spaced repetition</p>
          <h3>Review due now</h3>
        </div>
        <span class="pill">${dueCards.length} due</span>
      </div>

      <article class="review-queue-card">
        <div>
          <p class="eyebrow">${escapeHtml(course.title)}</p>
          <h4>${escapeHtml(nextCard.prompt)}</h4>
          <p>${escapeHtml(nextCard.answer)}</p>
          <p class="helper-text">Pronunciation: ${escapeHtml(nextCard.pronunciation)}</p>
        </div>
        <div class="card-actions">
          <button class="button button--ghost" data-action="rate-review" data-rating="hard">Hard</button>
          <button class="button button--secondary" data-action="rate-review" data-rating="good">Good</button>
          <button class="button" data-action="rate-review" data-rating="easy">Easy</button>
        </div>
      </article>
    </section>
  `;
}

function renderPractice() {
  return `
    <section class="hero-panel hero-panel--compact hero-panel--duo">
      <div class="hero-panel__copy">
        <p class="eyebrow">Practice</p>
        <h2>Learn by doing, one small challenge at a time.</h2>
        <p>Choose coding, language drills, or review and stay inside one focused session.</p>
      </div>
      <div class="hero-panel__stats">
        <div class="spotlight-card">
          <span>Mode</span>
          <strong>${escapeHtml(state.practiceMode)}</strong>
          <p>Switch modes without losing your place.</p>
        </div>
      </div>
    </section>

    <section class="surface surface--compact">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Practice workspace</p>
          <h3>Choose one mode and focus on one task at a time</h3>
        </div>
      </div>
      <p>Switch between coding, language practice, and review without leaving your current learning flow.</p>
    </section>

    ${renderLessonMission()}

    <section class="surface practice-tabs">
      <button
        class="${state.practiceMode === 'coding' ? 'is-active' : ''}"
        data-action="switch-practice"
        data-mode="coding"
      >
        Coding studio
      </button>
      <button
        class="${state.practiceMode === 'language' ? 'is-active' : ''}"
        data-action="switch-practice"
        data-mode="language"
      >
        Language studio
      </button>
      <button
        class="${state.practiceMode === 'review' ? 'is-active' : ''}"
        data-action="switch-practice"
        data-mode="review"
      >
        Review queue
      </button>
    </section>

    ${
      state.practiceMode === 'coding'
        ? renderCodingLab()
        : state.practiceMode === 'language'
          ? renderLanguageLab()
          : renderReviewLab()
    }

    ${renderAiCoachSurface()}
  `;
}

function renderForumThreads() {
  return forumThreads
    .map((thread) => {
      const course = courseMap.get(thread.courseId);
      return `
        <article class="community-card">
          <div class="community-card__header">
            <div>
              <p class="eyebrow">${escapeHtml(course.title)}</p>
              <h4>${escapeHtml(thread.title)}</h4>
            </div>
            <button class="link-button" data-action="view-course" data-course-id="${course.id}">
              Open course
            </button>
          </div>
          <div class="card-metrics">
            <span>${escapeHtml(thread.category)}</span>
            <span>${thread.replies} replies</span>
            <span>${escapeHtml(thread.activity)}</span>
          </div>
          <p>Started by ${escapeHtml(thread.author)}</p>
        </article>
      `;
    })
    .join('');
}

function renderPartners() {
  return practicePartners
    .map(
      (partner) => `
        <article class="community-card">
          <div class="community-card__header">
            <div>
              <p class="eyebrow">${partner.match}% compatibility</p>
              <h4>${escapeHtml(partner.name)}</h4>
            </div>
            <button class="button button--secondary" data-action="connect-partner" data-partner-id="${partner.id}">
              Connect
            </button>
          </div>
          <p>${escapeHtml(partner.focus)}</p>
          <div class="card-metrics">
            <span>${escapeHtml(partner.timezone)}</span>
            <span>${escapeHtml(partner.availability)}</span>
          </div>
          <p>${escapeHtml(partner.note)}</p>
        </article>
      `
    )
    .join('');
}

function renderCodeReviews() {
  return codeReviewRequests
    .map(
      (review) => `
        <article class="community-card">
          <div class="community-card__header">
            <div>
              <p class="eyebrow">${escapeHtml(review.language)}</p>
              <h4>${escapeHtml(review.project)}</h4>
            </div>
            <button class="button button--secondary" data-action="accept-review" data-review-id="${review.id}">
              Review request
            </button>
          </div>
          <p>${escapeHtml(review.needs)}</p>
          <div class="card-metrics">
            <span>Author: ${escapeHtml(review.author)}</span>
            <span>Due: ${escapeHtml(review.due)}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function renderCommunity() {
  const content =
    state.communityTab === 'forums'
      ? renderForumThreads()
      : state.communityTab === 'partners'
        ? renderPartners()
        : renderCodeReviews();

  return `
    <section class="surface practice-tabs">
      <button
        class="${state.communityTab === 'forums' ? 'is-active' : ''}"
        data-action="switch-community"
        data-tab="forums"
      >
        Course forums
      </button>
      <button
        class="${state.communityTab === 'partners' ? 'is-active' : ''}"
        data-action="switch-community"
        data-tab="partners"
      >
        Practice partners
      </button>
      <button
        class="${state.communityTab === 'reviews' ? 'is-active' : ''}"
        data-action="switch-community"
        data-tab="reviews"
      >
        Peer code reviews
      </button>
    </section>

    <section class="community-grid">
      ${content}
    </section>
  `;
}

function renderPricing() {
  const premiumCourses = courseCatalog.filter((course) => course.access !== 'free');

  if (!PAYMENTS_ENABLED) {
    return `
      <section class="hero-panel hero-panel--compact">
        <div class="hero-panel__copy">
          <p class="eyebrow">Roadmap</p>
          <h2>Payments are paused while we focus on the core learning experience.</h2>
          <p>
            For now, courses stay open in preview mode. The next priority is better lessons,
            progress tracking, practice quality, and overall product polish.
          </p>
        </div>
        <div class="hero-panel__stats">
          <div class="spotlight-card">
            <span>Status</span>
            <strong>Core product first</strong>
            <p>Billing, subscriptions, and checkout will come later if needed.</p>
          </div>
        </div>
      </section>

      <section class="page-grid">
        <article class="surface surface--wide">
          <div class="section-heading">
            <div>
              <p class="eyebrow">What stays active</p>
              <h3>Everything important for learners is still available</h3>
            </div>
          </div>
          <ul class="feature-list">
            <li>All coding and language courses remain accessible in preview mode.</li>
            <li>Practice labs, streaks, XP, badges, and progress tracking continue working.</li>
            <li>Auth and profile sync stay available without forcing a paid flow.</li>
          </ul>
        </article>

        <article class="surface">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Later</p>
              <h3>Monetization backlog</h3>
            </div>
          </div>
          <ul class="feature-list">
            <li>Pro subscriptions</li>
            <li>One-time course purchases</li>
            <li>Certificate checkout and unlock rules</li>
          </ul>
        </article>
      </section>

      <section class="surface">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Future plans</p>
            <h3>Potential paid-ready catalog markers</h3>
          </div>
        </div>
        <div class="course-grid">
          ${premiumCourses
            .map(
              (course) => `
                <article class="course-card">
                  <div class="course-card__header">
                    <div>
                      <p class="eyebrow">${escapeHtml(course.language)}</p>
                      <h3>${escapeHtml(course.title)}</h3>
                    </div>
                    <span class="pill">${escapeHtml(course.priceLabel)}</span>
                  </div>
                  <p>${escapeHtml(course.subtitle)}</p>
                  <div class="card-actions">
                    <button class="button button--ghost" data-action="view-course" data-course-id="${course.id}">
                      View course
                    </button>
                    <button class="button" data-action="enroll-course" data-course-id="${course.id}">
                      Open in preview
                    </button>
                  </div>
                </article>
              `
            )
            .join('')}
        </div>
      </section>
    `;
  }

  return `
    <section class="hero-panel hero-panel--compact">
      <div class="hero-panel__copy">
        <p class="eyebrow">Monetization</p>
        <h2>Free tier, Pro subscriptions, and one-time course purchases.</h2>
        <p>
          This app now includes clear upsell paths, certificate logic, and premium content access.
        </p>
      </div>
      <div class="hero-panel__stats">
        <div class="spotlight-card">
          <span>Current plan</span>
          <strong>${escapeHtml(state.profile.subscription.toUpperCase())}</strong>
          <p>${getTotalCertificatesReady()} certificates currently available to claim.</p>
        </div>
      </div>
    </section>

    <section class="pricing-grid">
      ${pricingPlans
        .map(
          (plan) => `
            <article class="pricing-card ${plan.highlight ? 'pricing-card--highlight' : ''}">
              <p class="eyebrow">${escapeHtml(plan.name)}</p>
              <h3>${escapeHtml(plan.price)}</h3>
              <p>${escapeHtml(plan.summary)}</p>
              <ul class="feature-list">
                ${plan.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}
              </ul>
              <button class="button" data-action="upgrade-plan" data-plan-id="${plan.id}">
                ${
                  state.profile.subscription === plan.id
                    ? 'Current plan'
                    : plan.id === 'team'
                      ? 'Contact sales'
                      : `Choose ${escapeHtml(plan.name)}`
                }
              </button>
            </article>
          `
        )
        .join('')}
    </section>

    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">One-time purchases</p>
          <h3>Premium standalone courses</h3>
        </div>
      </div>
      <div class="course-grid">
        ${premiumCourses
          .map(
            (course) => `
              <article class="course-card">
                <div class="course-card__header">
                  <div>
                    <p class="eyebrow">${escapeHtml(course.language)}</p>
                    <h3>${escapeHtml(course.title)}</h3>
                  </div>
                  <span class="pill">${escapeHtml(course.priceLabel)}</span>
                </div>
                <p>${escapeHtml(course.subtitle)}</p>
                <div class="card-actions">
                  <button class="button button--ghost" data-action="view-course" data-course-id="${course.id}">
                    View details
                  </button>
                  ${
                    course.access === 'purchase'
                      ? `<button class="button" data-action="purchase-course" data-course-id="${course.id}">
                          Buy now
                        </button>`
                      : `<button class="button" data-action="upgrade-plan" data-plan-id="pro">
                          Unlock with Pro
                        </button>`
                  }
                </div>
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderBadgeCards() {
  return achievementCatalog
    .map((badge) => {
      const unlocked = state.profile.badges.includes(badge.id);
      return `
        <article class="badge-card ${unlocked ? 'is-unlocked' : ''}">
          <span class="badge-mark">${unlocked ? 'Unlocked' : 'Locked'}</span>
          <h4>${escapeHtml(badge.name)}</h4>
          <p>${escapeHtml(badge.description)}</p>
        </article>
      `;
    })
    .join('');
}

function renderProfileCourseRows() {
  return Object.entries(state.profile.courseProgress)
    .filter(([, progress]) => progress.enrolled)
    .map(([courseId, progress]) => {
      const course = courseMap.get(courseId);
      return `
        <div class="profile-course-row">
          <div>
            <strong>${escapeHtml(course.title)}</strong>
            <p>${escapeHtml(progress.nextLesson)}</p>
          </div>
          <div class="profile-course-row__metrics">
            <span>${progress.completion}% complete</span>
            <span>${progress.quizAverage}% quiz avg</span>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderProfile() {
  const level = getLevelFromXp(state.profile.xp);

  return `
    <section class="hero-panel hero-panel--compact">
      <div class="hero-panel__copy">
        <p class="eyebrow">User profile</p>
        <h2>${escapeHtml(state.profile.name)}</h2>
        <p>${escapeHtml(state.profile.headline)}</p>
        <div class="hero-panel__actions">
          ${
            state.user
              ? `<button class="button button--secondary" data-action="sign-out">Sign out</button>`
              : `<button class="button" data-action="open-auth">Sign up / Login</button>`
          }
          <button class="button button--secondary" data-action="navigate" data-route="welcome">
            Change learning focus
          </button>
          <button class="button button--ghost" data-action="navigate" data-route="pricing">
            ${PAYMENTS_ENABLED ? 'Manage plan' : 'View roadmap'}
          </button>
        </div>
      </div>
      <div class="hero-panel__stats">
        <div class="spotlight-card">
          <span>Level</span>
          <strong>${level}</strong>
          <p>${state.profile.xp} XP total • ${state.profile.streak} day streak</p>
        </div>
      </div>
    </section>

    <section class="page-grid">
      <article class="surface surface--wide">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Learning goals</p>
            <h3>Goals that shape the dashboard</h3>
          </div>
        </div>
        <ul class="feature-list">
          ${state.profile.learningGoals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}
        </ul>
        <form class="stack-form stack-form--inline" data-form="goal-form">
          <input name="goal_text" type="text" placeholder="Add a new learning goal" />
          <button class="button" type="submit">Add goal</button>
        </form>
      </article>

      <article class="surface">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Auth and sync</p>
            <h3>${escapeHtml(state.syncStatus)}</h3>
          </div>
        </div>
        <p>${state.user ? escapeHtml(state.profile.email) : 'Guest mode active on this device.'}</p>
        <p>Provider: ${escapeHtml(state.profile.authProvider)}</p>
        <form class="stack-form" data-form="weekly-goal-form">
          <label for="weekly-goal">Weekly goal in minutes</label>
          <input
            id="weekly-goal"
            name="weekly_goal_minutes"
            type="number"
            min="30"
            max="1200"
            value="${state.profile.weeklyGoal}"
          />
          <button class="button button--secondary" type="submit">Update weekly goal</button>
        </form>
      </article>
    </section>

    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Achievements</p>
          <h3>Badges and milestones</h3>
        </div>
      </div>
      <div class="badge-grid">
        ${renderBadgeCards()}
      </div>
    </section>

    <section class="surface">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Progress dashboard</p>
          <h3>Current courses</h3>
        </div>
      </div>
      <div class="profile-course-list">
        ${renderProfileCourseRows()}
      </div>
    </section>
  `;
}

function renderPage() {
  switch (state.route) {
    case 'welcome':
      return renderWelcomePage();
    case 'dashboard':
      return renderDashboard();
    case 'courses':
      return renderCourses();
    case 'course-detail':
      return renderCourseDetail();
    case 'practice':
      return renderPractice();
    case 'community':
      return renderCommunity();
    case 'pricing':
      return renderPricing();
    case 'profile':
      return renderProfile();
    default:
      return renderDashboard();
  }
}

function renderAuthModal() {
  if (!state.authModalOpen) {
    return '';
  }

  return `
    <div class="modal-backdrop" data-action="close-auth">
      <div class="modal-card" data-stop-click="true">
        <div class="section-heading section-heading--tight">
          <div>
            <p class="eyebrow">Authentication</p>
            <h3>${state.authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h3>
          </div>
          <button class="icon-button" data-action="close-auth">Close</button>
        </div>

        <button class="button button--secondary button--full" data-action="google-auth" ${
          state.authBusy ? 'disabled' : ''
        }>
          Continue with Google
        </button>

        <form class="stack-form" data-form="auth-form">
          ${
            state.authMode === 'signup'
              ? '<input name="display_name" type="text" placeholder="Full name" />'
              : ''
          }
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button class="button button--full" type="submit" ${state.authBusy ? 'disabled' : ''}>
            ${state.authBusy ? 'Working...' : state.authMode === 'signup' ? 'Create account' : 'Login'}
          </button>
        </form>

        ${
          state.authError ? `<p class="feedback-note feedback-note--error">${escapeHtml(state.authError)}</p>` : ''
        }

        <button class="link-button" data-action="toggle-auth-mode">
          ${
            state.authMode === 'signup'
              ? 'Already have an account? Switch to login'
              : 'Need an account? Switch to signup'
          }
        </button>
      </div>
    </div>
  `;
}

function renderAiSettingsModal() {
  if (!state.aiSettingsOpen) {
    return '';
  }

  return `
    <div class="modal-backdrop" data-action="close-ai-settings">
      <div class="modal-card" data-stop-click="true">
        <div class="section-heading section-heading--tight">
          <div>
            <p class="eyebrow">AI settings</p>
            <h3>Enable secure AI tutor agents</h3>
          </div>
          <button class="icon-button" data-action="close-ai-settings">Close</button>
        </div>

        <p>
          This app now supports production-style AI through a serverless backend route. Do not put provider keys in the browser.
        </p>
        <ul class="feature-list">
          <li>Set <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> in your server or Vercel environment variables.</li>
          <li>Optionally set <code>AI_PROVIDER</code> to <code>gemini</code>, <code>openai</code>, or leave it on auto.</li>
          <li>Deploy the included <code>/api/ai</code> route so frontend requests go through the backend.</li>
          <li>The app will automatically switch from local coach to a hosted AI coach when the backend is available.</li>
        </ul>
        <button class="button" data-action="confirm-ai-settings">Got it</button>
      </div>
    </div>
  `;
}

function renderToast() {
  return state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : '';
}

function renderApp() {
  if (state.route === 'welcome') {
    app.innerHTML = `
      ${renderWelcomePage()}
      ${renderAuthModal()}
      ${renderAiSettingsModal()}
      ${renderToast()}
    `;
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <div class="workspace">
        ${renderTopBar()}
        <main class="page-content">
          ${renderPage()}
        </main>
      </div>
    </div>
    ${renderMobileNav()}
    ${renderAuthModal()}
    ${renderAiSettingsModal()}
    ${renderToast()}
  `;
}

function handleAction(target) {
  const action = target.dataset.action;

  switch (action) {
    case 'choose-start-course':
      applyStartingChoice(target.dataset.courseId);
      return;
    case 'navigate':
      state.route = target.dataset.route;
      commit();
      return;
    case 'open-ai-settings':
      state.aiSettingsOpen = true;
      state.aiError = '';
      renderApp();
      return;
    case 'close-ai-settings':
      handleCloseAiSettings();
      return;
    case 'confirm-ai-settings':
      handleCloseAiSettings();
      return;
    case 'open-auth':
      state.authModalOpen = true;
      state.authError = '';
      renderApp();
      return;
    case 'close-auth':
      state.authModalOpen = false;
      state.authBusy = false;
      state.authError = '';
      renderApp();
      return;
    case 'toggle-auth-mode':
      state.authMode = state.authMode === 'signup' ? 'login' : 'signup';
      state.authError = '';
      renderApp();
      return;
    case 'google-auth':
      handleGoogleAuth();
      return;
    case 'sign-out':
      handleSignOut();
      return;
    case 'set-filter':
      state.catalogFilter = target.dataset.filter;
      commit();
      return;
    case 'view-course':
      state.selectedCourseId = target.dataset.courseId;
      state.route = 'course-detail';
      commit();
      return;
    case 'enroll-course':
      enrollCourse(target.dataset.courseId);
      return;
    case 'purchase-course':
      buyCourse(target.dataset.courseId);
      return;
    case 'upgrade-plan':
      upgradePlan(target.dataset.planId);
      return;
    case 'generate-study-plan':
      handleGenerateStudyPlan();
      return;
    case 'start-course':
      enrollCourse(target.dataset.courseId);
      setPracticeCourse(target.dataset.courseId);
      commit();
      return;
    case 'switch-practice':
      state.practiceMode = target.dataset.mode;
      state.route = 'practice';
      state.flashcardFlipped = false;
      commit();
      return;
    case 'run-code':
      handleCodeRun(target.dataset.mode);
      return;
    case 'quick-ai':
      handleQuickAgent(target.dataset.agent);
      return;
    case 'complete-lesson-step':
      handleLessonTaskComplete(target.dataset.courseId, target.dataset.taskId);
      return;
    case 'refresh-lesson':
      handleRefreshLessonMission();
      return;
    case 'reset-code': {
      const course = courseMap.get(state.codingCourseId);
      state.codingDrafts[course.id] = course.codingStudio.starterCode;
      state.codingOutput = 'Editor reset to the starter challenge.';
      state.codingFeedback = '';
      state.codingTestResults = [];
      commit('Coding editor reset.');
      return;
    }
    case 'flip-card':
      state.flashcardFlipped = !state.flashcardFlipped;
      renderApp();
      return;
    case 'speak-card': {
      const course = courseMap.get(state.languageCourseId);
      const card = getCurrentFlashcard();
      speakText(card.front, course.languageStudio.voice);
      return;
    }
    case 'rate-card':
      handleFlashcardReview(target.dataset.rating);
      return;
    case 'submit-fill-blank':
      handleFillBlank(target.dataset.value);
      return;
    case 'rate-review':
      handleReviewQueue(target.dataset.rating);
      return;
    case 'switch-community':
      state.communityTab = target.dataset.tab;
      commit();
      return;
    case 'connect-partner':
      commit('Practice partner request sent.');
      return;
    case 'accept-review':
      commit('Peer review session reserved.');
      return;
    default:
      break;
  }
}

function attachListeners() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    const stopTarget = event.target.closest('[data-stop-click="true"]');

    if (!target) {
      return;
    }

    if (stopTarget && !stopTarget.contains(target)) {
      return;
    }

    handleAction(target);
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formName = form.dataset.form;

    if (!formName) {
      return;
    }

    event.preventDefault();
    const data = new FormData(form);

    switch (formName) {
      case 'auth-form':
        handleEmailAuth(data);
        return;
      case 'ai-coach-form':
        handleAiCoachSubmit(data);
        form.reset();
        return;
      case 'catalog-search-form':
        handleSearch(data);
        return;
      case 'daily-challenge-form':
        handleDailyChallengeSubmit(data);
        return;
      case 'translation-form':
        handleTranslationSubmit(data);
        return;
      case 'goal-form':
        handleGoalSubmit(data);
        form.reset();
        return;
      case 'mentor-note-form':
        handleMentorNoteSubmit(data);
        form.reset();
        return;
      case 'weekly-goal-form':
        handleWeeklyGoal(data);
        return;
      default:
        break;
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.name === 'agent_type') {
      state.aiAgentType = target.value;
      saveLocalState();
      return;
    }

    if (target.dataset.select === 'coding-course') {
      state.codingCourseId = target.value;
      state.selectedCourseId = target.value;
      ensureLessonSession(target.value);
      state.codingOutput = 'Course changed. Run code or tests to begin.';
      state.codingFeedback = '';
      state.codingTestResults = [];
      commit();
      return;
    }

    if (target.dataset.select === 'language-course') {
      state.languageCourseId = target.value;
      state.selectedCourseId = target.value;
      ensureLessonSession(target.value);
      state.flashcardIndex = 0;
      state.flashcardFlipped = false;
      state.practiceFeedback = '';
      commit();
    }
  });

  document.addEventListener('input', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (target.dataset.input === 'code-editor') {
      state.codingDrafts[state.codingCourseId] = target.value;
      saveLocalState();
    }
  });
}

function init() {
  hydrateState();
  seedCodingDrafts();
  seedReviewQueue();
  syncBadges();
  bootstrapLearningWorkspace();
  attachListeners();
  renderApp();
  subscribeToAuth();
}

init();
