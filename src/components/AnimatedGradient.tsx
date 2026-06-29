import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { palette } from '../theme';

interface BlobSpec {
  color: string;
  size: number; // fraction of screen width
  x: number; // 0–1 base position
  y: number;
  drift: number; // px amplitude
  duration: number;
  delay: number;
  opacity: number;
}

interface Props {
  /** Override the blob color set (defaults to the neo-gradient family). */
  colors?: string[];
  /** Dim factor for the whole layer (0–1). */
  intensity?: number;
  style?: ViewStyle;
}

/**
 * A living "neo-gradient" — several soft radial blobs that drift organically.
 * Pure SVG + Reanimated transforms: GPU-cheap, smooth, and cross-platform.
 */
export function AnimatedGradient({ colors, intensity = 1, style }: Props) {
  const { width, height } = useWindowDimensions();

  const blobs = useMemo<BlobSpec[]>(() => {
    const set =
      colors && colors.length
        ? colors
        : [palette.violet, palette.pink, palette.coral, palette.amber, palette.indigo];
    const presets = [
      { x: 0.18, y: 0.12, size: 1.15, drift: 46, duration: 9000, opacity: 0.85 },
      { x: 0.86, y: 0.22, size: 0.95, drift: 60, duration: 11000, opacity: 0.8 },
      { x: 0.72, y: 0.7, size: 1.25, drift: 54, duration: 13000, opacity: 0.7 },
      { x: 0.2, y: 0.82, size: 1.05, drift: 50, duration: 10000, opacity: 0.75 },
      { x: 0.5, y: 0.45, size: 0.8, drift: 40, duration: 12000, opacity: 0.55 },
    ];
    return presets.map((p, i) => ({
      ...p,
      color: set[i % set.length],
      delay: i * 600,
    }));
  }, [colors]);

  return (
    <View style={[StyleSheet.absoluteFill, { opacity: intensity }, style]} pointerEvents="none">
      {blobs.map((b, i) => (
        <Blob key={i} spec={b} screenW={width} screenH={height} />
      ))}
    </View>
  );
}

function Blob({
  spec,
  screenW,
  screenH,
}: {
  spec: BlobSpec;
  screenW: number;
  screenH: number;
}) {
  const t = useSharedValue(0);
  const diameter = screenW * spec.size;

  useEffect(() => {
    t.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, {
          duration: spec.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, [spec.delay, spec.duration, t]);

  const animStyle = useAnimatedStyle(() => {
    const p = t.value; // 0–1, eased
    return {
      transform: [
        { translateX: Math.sin(p * Math.PI * 2) * spec.drift },
        { translateY: Math.cos(p * Math.PI * 2) * spec.drift },
        { scale: 1 + p * 0.12 },
      ],
    };
  });

  const left = spec.x * screenW - diameter / 2;
  const top = spec.y * screenH - diameter / 2;
  const gid = `g${spec.color.replace('#', '')}${Math.round(spec.x * 100)}`;

  return (
    <Animated.View
      style={[
        { position: 'absolute', left, top, width: diameter, height: diameter },
        animStyle,
      ]}
    >
      <Svg width={diameter} height={diameter}>
        <Defs>
          <RadialGradient id={gid} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={spec.color} stopOpacity={spec.opacity} />
            <Stop offset="55%" stopColor={spec.color} stopOpacity={spec.opacity * 0.35} />
            <Stop offset="100%" stopColor={spec.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={diameter / 2} cy={diameter / 2} r={diameter / 2} fill={`url(#${gid})`} />
      </Svg>
    </Animated.View>
  );
}
