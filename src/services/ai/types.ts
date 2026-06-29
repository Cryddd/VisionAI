/** Analysis modes presented after capture. */
export type AnalysisMode = 'academic' | 'safety' | 'inventory';

export interface ModeMeta {
  id: AnalysisMode;
  title: string;
  tagline: string;
  description: string;
}

export interface DetectedObject {
  /** Object label, e.g. "ceramic mug". */
  name: string;
  /** Short qualifier, e.g. "on the desk, half full". */
  detail?: string;
  /** Optional model confidence 0–1. */
  confidence?: number;
}

/** Optional Roboflow bounding-box prediction. */
export interface BoxDetection {
  label: string;
  confidence: number; // 0–1
  /** Normalized box (0–1) relative to image dimensions. */
  box: { x: number; y: number; width: number; height: number };
}

/** The structured result rendered as cards. */
export interface AnalysisResult {
  mode: AnalysisMode;
  /** Punchy headline for the result, e.g. "A focused home workspace". */
  headline: string;
  /** One- or two-sentence overall summary. */
  summary: string;
  objects: DetectedObject[];
  sceneContext: string;
  activities: string[];
  recommendations: string[];
  /** Populated only when Roboflow is enabled and succeeds. */
  detections?: BoxDetection[];
  /** Provider/model used, for transparency. */
  model: string;
  createdAt: number;
}

/** Input image for any vision provider. */
export interface VisionImage {
  /** Base64-encoded image data (no data: prefix). */
  base64: string;
  mimeType: string;
  /** Pixel dimensions, used to scale Roboflow boxes. */
  width?: number;
  height?: number;
}

export interface VisionRuntimeConfig {
  geminiApiKey: string;
  geminiModel: string;
  roboflowApiKey?: string;
  roboflowModel?: string;
}

/** Contract every vision provider implements (modular / swappable). */
export interface VisionProvider {
  readonly id: string;
  analyze(
    image: VisionImage,
    mode: AnalysisMode,
    config: VisionRuntimeConfig
  ): Promise<Omit<AnalysisResult, 'detections' | 'createdAt'>>;
}
