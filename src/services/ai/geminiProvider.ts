import {
  AnalysisMode,
  AnalysisResult,
  VisionImage,
  VisionProvider,
  VisionRuntimeConfig,
} from './types';
import { buildPrompt, RESPONSE_SCHEMA } from './prompts';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Gemini 2.5+ Vision provider.
 *
 * Implemented against the REST API (no SDK) so the model id is fully
 * swappable via config — drop in any future "gemini-x" vision model.
 */
export const geminiProvider: VisionProvider = {
  id: 'gemini',

  async analyze(
    image: VisionImage,
    mode: AnalysisMode,
    config: VisionRuntimeConfig
  ): Promise<Omit<AnalysisResult, 'detections' | 'createdAt'>> {
    if (!config.geminiApiKey) {
      throw new Error(
        'Missing Gemini API key. Add one in Settings to run analysis.'
      );
    }

    const model = config.geminiModel || 'gemini-2.5-flash';
    const url = `${API_ROOT}/models/${model}:generateContent?key=${encodeURIComponent(
      config.geminiApiKey
    )}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildPrompt(mode) },
            {
              inline_data: {
                mime_type: image.mimeType,
                data: image.base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new Error(
        'Network error reaching Gemini. Check your connection and try again.'
      );
    }

    if (!response.ok) {
      const detail = await safeErrorMessage(response);
      throw new Error(detail);
    }

    const json = await response.json();
    const text: string | undefined =
      json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      const blockReason = json?.promptFeedback?.blockReason;
      throw new Error(
        blockReason
          ? `Gemini declined to analyze this image (${blockReason}).`
          : 'Gemini returned an empty response. Try recapturing the photo.'
      );
    }

    const parsed = parseJson(text);

    return {
      mode,
      model,
      headline: str(parsed.headline) || 'Analysis complete',
      summary: str(parsed.summary),
      objects: Array.isArray(parsed.objects)
        ? parsed.objects
            .map((o: any) => ({
              name: str(o?.name),
              detail: str(o?.detail) || undefined,
            }))
            .filter((o: { name: string }) => o.name)
        : [],
      sceneContext: str(parsed.sceneContext),
      activities: toStringArray(parsed.activities),
      recommendations: toStringArray(parsed.recommendations),
    };
  },
};

function parseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    // Model occasionally wraps JSON in prose/fences — extract the object.
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    throw new Error('Could not parse the AI response. Please try again.');
  }
}

async function safeErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    const msg = data?.error?.message as string | undefined;
    if (response.status === 400 && msg?.includes('API key')) {
      return 'Invalid Gemini API key. Update it in Settings.';
    }
    if (response.status === 429) {
      return 'Gemini rate limit reached. Wait a moment and try again.';
    }
    return msg ? `Gemini error: ${msg}` : `Gemini error (${response.status}).`;
  } catch {
    return `Gemini error (${response.status}).`;
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const toStringArray = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => str(x)).filter(Boolean)
    : [];
