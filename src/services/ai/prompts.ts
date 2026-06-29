import { AnalysisMode, ModeMeta } from './types';

/** Display metadata for the three analysis modes. */
export const MODES: Record<AnalysisMode, ModeMeta> = {
  academic: {
    id: 'academic',
    title: 'Academic',
    tagline: 'Learn what you see',
    description: 'Explain what this is and what it can teach me.',
  },
  safety: {
    id: 'safety',
    title: 'Safety',
    tagline: 'Check for risks',
    description: 'Spot anything risky and how to stay safe.',
  },
  inventory: {
    id: 'inventory',
    title: 'Inventory',
    tagline: 'Count what’s there',
    description: 'Count and list the items I can see.',
  },
};

export const MODE_ORDER: AnalysisMode[] = ['academic', 'safety', 'inventory'];

const BASE_INSTRUCTION = `You are VisionAI, an expert visual analyst. Examine the provided photo carefully and respond with a single JSON object that matches the required schema. Be specific and grounded in what is actually visible — never invent objects that are not present. Keep language crisp, confident, and useful.`;

const MODE_LENS: Record<AnalysisMode, string> = {
  academic: `Adopt an ACADEMIC lens. Treat the image as a subject of study: identify notable objects with educational relevance, explain the scene's context as an instructor would, describe activities or processes implied, and give recommendations framed as learning opportunities or further study.`,
  safety: `Adopt a SAFETY lens. Identify objects that are relevant to safety (hazards, protective equipment, exits, conditions). Describe the scene's overall risk context, the activities happening and how safe they are, and recommendations as concrete protective or corrective actions, ordered by priority.`,
  inventory: `Adopt an INVENTORY lens. Itemize visible objects as if performing a stock take — include approximate quantities and condition in each object's detail. The scene context should summarize the space/storage. Activities describe how items appear to be used or organized. Recommendations cover restocking, organization, or cataloging actions.`,
};

export function buildPrompt(mode: AnalysisMode): string {
  return `${BASE_INSTRUCTION}\n\n${MODE_LENS[mode]}\n\nReturn 3–8 objects, 2–6 activities, and 2–6 recommendations. The headline must be under 8 words.`;
}

/** JSON schema passed to Gemini for guaranteed structured output. */
export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    objects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['name'],
      },
    },
    sceneContext: { type: 'string' },
    activities: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'headline',
    'summary',
    'objects',
    'sceneContext',
    'activities',
    'recommendations',
  ],
} as const;
