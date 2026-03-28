function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function createDefaultLearningWorkspace() {
  return {
    aiModeLabel: 'Local coach',
    studyPlan: null,
    lessonSessions: {},
    agentSessions: [],
    mentorNotes: [],
    activityFeed: [],
    savedAt: null
  };
}

export function mergeLearningWorkspace(base, incoming) {
  const result = clone(base);

  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (isObject(value) && isObject(result[key])) {
      result[key] = mergeLearningWorkspace(result[key], value);
      return;
    }

    result[key] = clone(value);
  });

  return result;
}

export function appendAgentSession(workspace, session) {
  workspace.agentSessions = [session, ...(workspace.agentSessions || [])].slice(0, 12);
  return workspace;
}

export function appendActivityEvent(workspace, event) {
  workspace.activityFeed = [event, ...(workspace.activityFeed || [])].slice(0, 18);
  return workspace;
}

export function appendMentorNote(workspace, note) {
  workspace.mentorNotes = [note, ...(workspace.mentorNotes || [])].slice(0, 10);
  return workspace;
}

export function upsertStudyPlan(workspace, plan) {
  workspace.studyPlan = plan;
  return workspace;
}

export function upsertLessonSession(workspace, session) {
  workspace.lessonSessions = workspace.lessonSessions || {};
  workspace.lessonSessions[session.courseId] = session;
  return workspace;
}

export async function loadRemoteLearningWorkspace(backend, userId) {
  const workspace = await backend.getLearningWorkspace(userId);

  if (!workspace) {
    return createDefaultLearningWorkspace();
  }

  return mergeLearningWorkspace(createDefaultLearningWorkspace(), workspace);
}

export async function saveRemoteLearningWorkspace(backend, userId, workspace) {
  await backend.saveLearningWorkspace(userId, {
    ...workspace,
    savedAt: new Date().toISOString()
  });
}
