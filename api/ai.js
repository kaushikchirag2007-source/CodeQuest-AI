import { GoogleGenerativeAI } from '@google/generative-ai';

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

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return req.body;
}

function parseJsonObject(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Model response did not contain valid JSON.');
  }

  return JSON.parse(jsonMatch[0]);
}

function buildStudyPlanPrompt(payload) {
  return `
${agentPrompts.planner}
Create a compact daily plan with 3 tasks for the learner.
Use a calm, practical tone and tie the plan to the learner's current progress.

Return strict JSON only using this shape:
{
  "headline": "string",
  "focusArea": "string",
  "rationale": "string",
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "type": "lesson | practice | review",
      "duration": "string",
      "instruction": "string",
      "successMetric": "string"
    }
  ],
  "coachTip": "string"
}

Payload:
${JSON.stringify(payload, null, 2)}
`;
}

function buildSmartAgentPrompt(payload) {
  return `
${payload.systemPrompt || agentPrompts.planner}
Help the learner with the exact problem they described.
Return short, useful explanations. Avoid fluff.

Return strict JSON only using this shape:
{
  "title": "string",
  "summary": "string",
  "bullets": ["string", "string", "string"],
  "nextSteps": ["string", "string", "string"],
  "savedNote": "string"
}

Payload:
${JSON.stringify(payload, null, 2)}
`;
}

function buildAdaptiveLessonPrompt(payload) {
  return `
You are an expert ${payload.track === 'programming' ? 'coding' : 'language'} tutor.
Generate one adaptive lesson item for the learner.

Return strict JSON only.

Allowed lesson JSON format:
{
  "id": "unique_string_id",
  "type": "teaching" | "quiz" | "sentence",
  "character": "byte" | "lingo" | "nova",
  "title": "Lesson Title",
  "explanation": "Detailed explanation for teaching/quiz",
  "analogy": "A clever analogy for teaching",
  "instruction": "What to do next",
  "code": "Code snippet for programming quiz (optional)",
  "challenge": "The question text for quiz",
  "options": ["Option A", "Option B", "..."],
  "answer": "Correct Option",
  "translation": "English translation for sentence builder",
  "answerChips": ["Part", "of", "sentence"],
  "chips": ["Distractor", "Part", "Part"]
}

Payload:
${JSON.stringify(payload, null, 2)}
`;
}

function buildPrompt(task, payload) {
  switch (task) {
    case 'study-plan':
      return buildStudyPlanPrompt(payload);
    case 'smart-agent':
      return buildSmartAgentPrompt(payload);
    case 'adaptive-lesson':
      return buildAdaptiveLessonPrompt(payload);
    default:
      throw new Error('Unsupported AI task.');
  }
}

function resolveProvider() {
  const requested = (process.env.AI_PROVIDER || 'auto').toLowerCase();

  if (requested === 'gemini') {
    return process.env.GEMINI_API_KEY ? 'gemini' : null;
  }

  if (requested === 'openai') {
    return process.env.OPENAI_API_KEY ? 'openai' : null;
  }

  if (process.env.GEMINI_API_KEY) {
    return 'gemini';
  }

  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }

  return null;
}

async function runGeminiPrompt(prompt) {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

function extractOpenAiText(body) {
  if (typeof body.output_text === 'string' && body.output_text.trim()) {
    return body.output_text.trim();
  }

  const text = (body.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === 'output_text' && typeof content.text === 'string')
    .map((content) => content.text.trim())
    .filter(Boolean)
    .join('\n');

  if (!text) {
    throw new Error('OpenAI response did not include text output.');
  }

  return text;
}

async function runOpenAiPrompt(prompt) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      instructions: 'Return strict JSON only. Do not wrap the response in markdown fences.',
      input: prompt
    })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body?.error?.message || 'OpenAI request failed.');
  }

  return extractOpenAiText(body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const provider = resolveProvider();

  if (!provider) {
    json(res, 503, {
      error: 'No hosted AI provider is configured. Add GEMINI_API_KEY or OPENAI_API_KEY on the server.'
    });
    return;
  }

  try {
    const { task, payload } = parseBody(req);

    if (!task || !payload) {
      json(res, 400, { error: 'Missing task or payload.' });
      return;
    }

    const prompt = buildPrompt(task, payload);
    const text =
      provider === 'gemini'
        ? await runGeminiPrompt(prompt)
        : await runOpenAiPrompt(prompt);
    const data = parseJsonObject(text);

    json(res, 200, { ok: true, provider, data });
  } catch (error) {
    console.error('AI proxy error', error);
    json(res, 500, { error: error.message || 'AI proxy request failed.' });
  }
}
