import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, type } from '../theme';

const PHASES = [
  'Reading the frame',
  'Identifying objects',
  'Mapping the scene',
  'Composing your analysis',
];

interface Props {
  gradient: readonly string[];
  label?: string;
}

/**
 * AI loading choreography: a breathing, rotating orb of the active mode's
 * gradient with three concentric pulsing rings and cycling status copy.
 */
export function AnalysisLoader({ gradient, label }: Props) {
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1
    );
    breathe.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [spin, breathe]);

  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p + 1) % PHASES.length),
      1600
    );
    return () => clearInterval(id);
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${spin.value * 360}deg` },
      { scale: 0.92 + breathe.value * 0.16 },
    ],
  }));

  const ring = (size: number, delay: number) => (
    <PulseRing key={size} size={size} color={gradient[0]} delay={delay} />
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.orbWrap}>
        {ring(190, 0)}
        {ring(150, 400)}
        <Animated.View style={[styles.orb, orbStyle]}>
          <LinearGradient
            colors={gradient as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <View style={styles.orbCore} />
      </View>

      <Animated.Text
        key={phase}
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={styles.phase}
      >
        {label ?? PHASES[phase]}
      </Animated.Text>
    </View>
  );
}

function PulseRing({
  size,
  color,
  delay,
}: {
  size: number;
  color: string;
  delay: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    const start = setTimeout(() => {
      p.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }),
        -1
      );
    }, delay);
    return () => clearTimeout(start);
  }, [delay, p]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - p.value),
    transform: [{ scale: 0.7 + p.value * 0.6 }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 36 },
  orbWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
  },
  orbCore: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.bg,
    opacity: 0.85,
  },
  phase: {
    ...type.headline,
    color: colors.ink,
    textAlign: 'center',
  },
});
