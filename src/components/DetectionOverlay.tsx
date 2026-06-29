import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { BoxDetection } from '../services/ai/types';
import { colors, radius, type } from '../theme';

interface Props {
  uri: string;
  detections: BoxDetection[];
  /** Rendered width; height derives from the image aspect ratio. */
  width: number;
  aspectRatio: number; // width / height
  accent: string;
}

/** Draws Roboflow bounding boxes + labels over a scaled image. */
export function DetectionOverlay({
  uri,
  detections,
  width,
  aspectRatio,
  accent,
}: Props) {
  const height = width / aspectRatio;
  return (
    <View style={[styles.wrap, { width, height }]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      {detections.map((d, i) => {
        const left = d.box.x * width;
        const top = d.box.y * height;
        const w = d.box.width * width;
        const h = d.box.height * height;
        return (
          <View
            key={i}
            style={[
              styles.box,
              { left, top, width: w, height: h, borderColor: accent },
            ]}
          >
            <View style={[styles.tag, { backgroundColor: accent }]}>
              <Text style={styles.tagText} numberOfLines={1}>
                {d.label} {Math.round(d.confidence * 100)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHi,
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 6,
  },
  tag: {
    position: 'absolute',
    top: -2,
    left: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    maxWidth: 140,
  },
  tagText: { ...type.caption, fontSize: 11, lineHeight: 14, color: colors.black },
});
