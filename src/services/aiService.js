const AI_ENDPOINT = '/api/ai';

let runtimeMode = 'local';
const runtimeLabels = {
  local: 'Local coach',
  gemini: 'Gemini coach',
  openai: 'ChatGPT coach'
};

const agentPrompts = {
  planner:
    'You are a supportive study planner. Create a realistic, motivating plan that helps the learner make progress today.',
  debugger:
    'You are a senior coding mentor. Explain bugs, suggest a safer next step, and keep the learner confident.',
  language:
    'You are a friendly language coach. Focus on pronunciation, vocabulary, usage, and fast confidence wins.',
  quiz:
    'You are an adaptive quiz coach. Diagnose the gap and create a short learning loop with explanation.'
};

export function isAiEnabled() {
  return runtimeMode !== 'local';
}

export function getAiModeLabel() {
  return runtimeLabels[runtimeMode] || 'AI coach';
}

async function callAiEndpoint(task, payload) {
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ task, payload })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'AI backend request failed.');
  }

  const body = await response.json();

  if (!body?.data) {
    throw new Error('AI backend returned an invalid response.');
  }

  return {
    data: body.data,
    provider: body.provider || 'gemini'
  };
}

function buildModuleSnapshot(course) {
  return (course.modules || [])
    .map((module) => `${module.stage}: ${module.title} -> ${module.lessons.join(', ')}`)
    .join('\n');
}

function buildFallbackStudyPlan({ course, profile, focusArea }) {
  const progress = profile.courseProgress?.[course.id];
  const stage = progress?.pathStage || course.modules?.[0]?.stage || 'Beginner';
  const lessons = course.modules?.[0]?.lessons?.slice(0, 3) || ['Core concept review'];

  return {
    headline: `Today's ${course.title} sprint`,
    focusArea: focusArea || progress?.currentLesson || course.subtitle,
    rationale: `You're currently in the ${stage} stage. This plan focuses on a small, finishable win so progress feels clear.`,
    tasks: lessons.map((lesson, index) => ({
      id: `${course.id}-task-${index + 1}`,
      title: lesson,
      type: index === 1 ? 'practice' : 'lesson',
      duration: `${10 + index * 5} min`,
      instruction:
        index === 0
          ? `Review ${lesson} and summarize the main idea in one sentence.`
          : index === 1
            ? `Complete one hands-on activity linked to ${lesson}.`
            : `Reflect on mistakes from ${lesson} and capture one improvement point.`,
      successMetric: index === 1 ? 'Complete the task without skipping feedback.' : 'Write one concrete takeaway.'
    })),
    coachTip:
      course.type === 'coding'
        ? 'Ship one clean solution before trying to optimize it.'
        : 'Say each answer out loud once before you move on.',
    generatedAt: new Date().toISOString(),
    source: 'local'
  };
}

function buildFallbackAgentResponse({ agentType, course, prompt, practiceContext }) {
  const trimmedPrompt = String(prompt || '').trim();
  const contextSummary = practiceContext?.summary || course.subtitle;

  const responses = {
    planner: {
      title: `Plan for ${course.title}`,
      summary: `Let's reduce the load and focus on one visible win inside ${contextSummary}.`,
      bullets: [
        'Start with the current concept before opening new material.',
        'Spend one focused block on practice, then one short block on review.',
        'Write down the exact mistake or phrase that slowed you down today.'
      ],
      nextSteps: [
        'Complete the guided mission step by step.',
        'Use the practice lab immediately after the short review.',
        'Save one mentor note so tomorrow starts faster.'
      ],
      savedNote: trimmedPrompt || `Stay consistent with ${course.title} and keep the session focused.`,
      source: 'local'
    },
    debugger: {
      title: `Debug mentor for ${course.title}`,
      summary: `The fastest path is to isolate one failing assumption in the current challenge.`,
      bullets: [
        'Re-read the expected output before changing the whole solution.',
        'Check naming, return values, and small syntax slips first.',
        'If the logic feels messy, rewrite the solution in one simpler pass.'
      ],
      nextSteps: [
        'Run the current code once to observe the output.',
        'Fix only the first failing issue, then retest.',
        'Save the corrected pattern as a note for the next challenge.'
      ],
      savedNote: trimmedPrompt || 'Debug small, verify fast, then refactor only if needed.',
      source: 'local'
    },
    language: {
      title: `Language coach for ${course.title}`,
      summary: `Confidence improves faster when you connect vocabulary to a situation you can imagine.`,
      bullets: [
        'Say the phrase slowly once, then once at natural speed.',
        'Link each new word to a travel, greeting, or daily-life scenario.',
        'When you miss an answer, repeat the correct one aloud immediately.'
      ],
      nextSteps: [
        'Play pronunciation once and copy it.',
        'Answer the fill-in-the-blank before checking the hint.',
        'Write one example sentence using the new word or phrase.'
      ],
      savedNote: trimmedPrompt || 'Speak before you overthink the grammar.',
      source: 'local'
    },
    quiz: {
      title: `Quiz coach for ${course.title}`,
      summary: `A short explanation loop will help the concept stick faster than repeating the same guess.`,
      bullets: [
        'Name the rule behind the answer before checking options again.',
        'Compare the correct choice with one wrong choice and note the difference.',
        'Repeat the pattern once more in a small example.'
      ],
      nextSteps: [
        'Use the hint or explanation to restate the rule in plain words.',
        'Solve one more practice item immediately after the explanation.',
        'Add the tricky point to your mentor notes.'
      ],
      savedNote: trimmedPrompt || 'Understand the rule, then practice the pattern once more.',
      source: 'local'
    }
  };

  return {
    ...responses[agentType],
    generatedAt: new Date().toISOString()
  };
}

async function runBackendTask(task, payload, fallbackFactory) {
  try {
    const result = await callAiEndpoint(task, payload);
    runtimeMode = result.provider || 'gemini';
    return result.data;
  } catch (error) {
    console.warn('Falling back to local AI response', error);
    runtimeMode = 'local';
    return fallbackFactory();
  }
}

export async function generateSmartStudyPlan({ course, profile, focusArea = '' }) {
  const fallback = () => buildFallbackStudyPlan({ course, profile, focusArea });

  const payload = {
    course: {
      id: course.id,
      title: course.title,
      type: course.type,
      subtitle: course.subtitle,
      modules: buildModuleSnapshot(course)
    },
    learner: {
      goals: profile.learningGoals,
      streak: profile.streak,
      xp: profile.xp,
      progress: profile.courseProgress?.[course.id] || null
    },
    focusArea
  };

  const data = await runBackendTask('study-plan', payload, fallback);

  return {
    ...fallback(),
    ...data,
    tasks: Array.isArray(data.tasks) && data.tasks.length ? data.tasks : fallback().tasks,
    generatedAt: new Date().toISOString(),
    source: isAiEnabled() ? runtimeMode : 'local'
  };
}

export async function askSmartAgent({
  agentType,
  course,
  prompt,
  practiceContext = {},
  profile
}) {
  const fallback = () =>
    buildFallbackAgentResponse({ agentType, course, prompt, practiceContext, profile });

  const payload = {
    agentType,
    systemPrompt: agentPrompts[agentType] || agentPrompts.planner,
    course: {
      id: course.id,
      title: course.title,
      type: course.type,
      subtitle: course.subtitle,
      modules: buildModuleSnapshot(course)
    },
    learner: {
      goals: profile.learningGoals,
      streak: profile.streak,
      progress: profile.courseProgress?.[course.id] || null
    },
    prompt,
    practiceContext
  };

  const data = await runBackendTask('smart-agent', payload, fallback);
  const base = fallback();

  return {
    title: data.title || base.title,
    summary: data.summary || base.summary,
    bullets: Array.isArray(data.bullets) && data.bullets.length ? data.bullets : base.bullets,
    nextSteps:
      Array.isArray(data.nextSteps) && data.nextSteps.length ? data.nextSteps : base.nextSteps,
    savedNote: data.savedNote || base.savedNote,
    generatedAt: new Date().toISOString(),
    source: isAiEnabled() ? runtimeMode : 'local'
  };
}

export async function generateAiLesson(track, language, difficulty, seenIds = []) {
  const fallbackLesson = {
    id: `fallback-${track}-${language}-${difficulty}-${seenIds.size || seenIds.length || 0}`,
    type: 'teaching',
    character: track === 'programming' ? 'byte' : 'lingo',
    title: `${language} practice checkpoint`,
    explanation:
      track === 'programming'
        ? `Let's review one small ${language} concept before the next challenge.`
        : `Let's review one useful ${language} phrase before the next activity.`,
    analogy: 'Small, repeated practice compounds into confidence.',
    instruction: 'Study the pattern, then try one more exercise.'
  };

  const data = await runBackendTask(
    'adaptive-lesson',
    {
      track,
      language,
      difficulty,
      seenIds: Array.from(seenIds || [])
    },
    () => fallbackLesson
  );

  return {
    ...fallbackLesson,
    ...data,
    source: isAiEnabled() ? runtimeMode : 'local'
  };
}
