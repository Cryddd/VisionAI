import { BoxDetection, VisionImage, VisionRuntimeConfig } from './types';

const API_ROOT = 'https://detect.roboflow.com';

/**
 * Optional Roboflow object-detection enhancement.
 *
 * Returns normalized bounding boxes + confidences to render alongside the
 * Gemini analysis. Failures are non-fatal — the caller treats them as
 * "no detections" so the core experience never breaks.
 */
export async function detectObjects(
  image: VisionImage,
  config: VisionRuntimeConfig
): Promise<BoxDetection[]> {
  if (!config.roboflowApiKey || !config.roboflowModel) return [];

  const url = `${API_ROOT}/${config.roboflowModel}?api_key=${encodeURIComponent(
    config.roboflowApiKey
  )}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: image.base64,
  });

  if (!response.ok) {
    throw new Error(`Roboflow error (${response.status}).`);
  }

  const json = await response.json();
  const imgW = json?.image?.width || image.width || 1;
  const imgH = json?.image?.height || image.height || 1;

  const predictions: any[] = Array.isArray(json?.predictions)
    ? json.predictions
    : [];

  return predictions
    .map((p): BoxDetection | null => {
      const w = Number(p?.width) || 0;
      const h = Number(p?.height) || 0;
      const cx = Number(p?.x) || 0;
      const cy = Number(p?.y) || 0;
      if (!w || !h) return null;
      return {
        label: String(p?.class ?? 'object'),
        confidence: Number(p?.confidence) || 0,
        // Roboflow gives center x/y; convert to normalized top-left box.
        box: {
          x: (cx - w / 2) / imgW,
          y: (cy - h / 2) / imgH,
          width: w / imgW,
          height: h / imgH,
        },
      };
    })
    .filter((d): d is BoxDetection => d !== null)
    .sort((a, b) => b.confidence - a.confidence);
}

export function isRoboflowEnabled(config: VisionRuntimeConfig): boolean {
  return Boolean(config.roboflowApiKey && config.roboflowModel);
}
