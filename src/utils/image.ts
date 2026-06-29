import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { CapturedPhoto } from '../context/CaptureContext';

/**
 * Downscale + compress a captured photo to a payload-friendly JPEG with
 * base64, keeping requests to Gemini fast while preserving enough detail.
 */
export async function prepareForAnalysis(
  uri: string,
  maxWidth = 1280
): Promise<CapturedPhoto> {
  const context = ImageManipulator.manipulate(uri).resize({ width: maxWidth });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    base64: true,
    compress: 0.7,
    format: SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    base64: result.base64 ?? '',
    mimeType: 'image/jpeg',
    width: result.width,
    height: result.height,
  };
}
