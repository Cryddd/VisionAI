import {
  AnalysisMode,
  AnalysisResult,
  VisionImage,
  VisionProvider,
  VisionRuntimeConfig,
} from './types';
import { geminiProvider } from './geminiProvider';
import { detectObjects, isRoboflowEnabled } from './roboflowProvider';

/**
 * Orchestrates a full analysis: runs the primary vision provider (Gemini)
 * for the structured cards and, if enabled, augments with Roboflow boxes.
 *
 * The primary provider is injectable so the model layer stays modular and
 * future-proof — swap `geminiProvider` for any VisionProvider.
 */
export async function analyzeImage(
  image: VisionImage,
  mode: AnalysisMode,
  config: VisionRuntimeConfig,
  provider: VisionProvider = geminiProvider
): Promise<AnalysisResult> {
  // Kick off Roboflow in parallel; never let it break the core flow.
  const detectionsPromise = isRoboflowEnabled(config)
    ? detectObjects(image, config).catch(() => undefined)
    : Promise.resolve(undefined);

  const core = await provider.analyze(image, mode, config);
  const detections = await detectionsPromise;

  return {
    ...core,
    detections: detections && detections.length ? detections : undefined,
    createdAt: Date.now(),
  };
}

export { geminiProvider, isRoboflowEnabled };
