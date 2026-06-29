import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { GrainOverlay } from '../components/GrainOverlay';
import { PressableScale } from '../components/PressableScale';
import { SettingsSheet } from '../components/SettingsSheet';
import { useSettings } from '../context/SettingsContext';
import { RootStackParamList } from '../navigation/types';
import { colors, fill, neoGradient, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const FEATURES = ['Objects', 'Context', 'Activities', 'Recommendations'];

// Ease-out-expo — the entrance grammar (things arriving).
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const rise = (delay: number) =>
  FadeInUp.delay(delay).duration(540).easing(EASE_OUT);

export function LandingScreen({ navigation }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { hasGeminiKey } = useSettings();
  const reduceMotion = useReducedMotion();

  // Cinematic "wake up": the gradient blooms in once on mount.
  const bloom = useSharedValue(reduceMotion ? 1 : 0);
  // Slow color shimmer for the accent word.
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    bloom.value = withTiming(1, { duration: 800, easing: EASE_OUT });
    shimmer.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reduceMotion, bloom, shimmer]);

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloom.value,
    transform: [{ scale: 1 + (1 - bloom.value) * 0.06 }],
  }));

  const accentStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      shimmer.value,
      [0, 0.5, 1],
      [colors.coral, colors.amber, colors.pink]
    ),
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Animated.View style={[fill, bloomStyle]} pointerEvents="none">
        <AnimatedGradient colors={[...neoGradient]} intensity={0.9} />
      </Animated.View>
      <View style={styles.darken} pointerEvents="none" />
      <GrainOverlay opacity={0.05} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top bar */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.topBar}>
          <View style={styles.brandRow}>
            <LiveDot active={!reduceMotion} />
            <Text style={styles.brand}>VISIONAI</Text>
          </View>
          <PressableScale
            haptic="light"
            onPress={() => setSettingsOpen(true)}
            style={styles.gear}
          >
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </PressableScale>
        </Animated.View>

        {/* Hero */}
        <View style={styles.hero}>
          <Animated.Text entering={rise(200)} style={styles.eyebrow}>
            GEMINI · VISION · INTELLIGENCE
          </Animated.Text>

          <View style={styles.headline}>
            <Animated.Text entering={rise(320)} style={styles.hWord}>
              Point.
            </Animated.Text>
            <Animated.Text entering={rise(430)} style={styles.hWord}>
              Capture.
            </Animated.Text>
            <Animated.Text
              entering={rise(540)}
              style={[styles.hWord, styles.hAccent, accentStyle]}
            >
              Understand.
            </Animated.Text>
          </View>

          <Animated.Text entering={rise(700)} style={styles.subcopy}>
            VisionAI reads any scene through Gemini Vision — naming the objects,
            the context, the activity, and what to do next.
          </Animated.Text>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f}
                entering={rise(820 + i * 60)}
                style={styles.featurePill}
              >
                <View style={styles.dot} />
                <Text style={styles.featureText}>{f}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <Animated.View entering={rise(1060)} style={styles.ctaWrap}>
          <HeroCTA
            reduceMotion={reduceMotion}
            onPress={() => navigation.navigate('Camera')}
          />
          {!hasGeminiKey && (
            <PressableScale haptic="none" onPress={() => setSettingsOpen(true)}>
              <Text style={styles.hint}>
                Add your Gemini API key to enable analysis
              </Text>
            </PressableScale>
          )}
        </Animated.View>
      </SafeAreaView>

      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

/** A small "AI is live" indicator: a soft pulsing ring around a mint core. */
function LiveDot({ active }: { active: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (active) {
      p.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1
      );
    }
  }, [active, p]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - p.value),
    transform: [{ scale: 0.6 + p.value * 1.8 }],
  }));
  return (
    <View style={styles.liveWrap}>
      <Animated.View style={[styles.liveRing, ringStyle]} />
      <View style={styles.liveCore} />
    </View>
  );
}

/**
 * Primary call-to-action with quiet, continuous life: a light sheen sweeps
 * across every few seconds and the surface breathes almost imperceptibly —
 * just enough to keep the eye drawn to the main action.
 */
function HeroCTA({
  onPress,
  reduceMotion,
}: {
  onPress: () => void;
  reduceMotion: boolean;
}) {
  const [width, setWidth] = useState(0);
  const sheen = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // Sweep: rest, then a quick pass across the button. Repeat.
    sheen.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(2400, withTiming(1, { duration: 1000, easing: Easing.in(Easing.quad) }))
      ),
      -1
    );
    breath.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reduceMotion, sheen, breath]);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.012 }],
  }));
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: width ? 0.28 : 0,
    transform: [
      { translateX: interpolate(sheen.value, [0, 1], [-80, width + 80]) },
      { skewX: '-18deg' },
    ],
  }));

  return (
    <PressableScale haptic="medium" onPress={onPress}>
      <Animated.View
        style={[styles.ctaClip, breathStyle]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={neoGradient as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaInner}
        >
          <Ionicons name="scan-outline" size={20} color={colors.black} />
          <Text style={styles.ctaLabel}>Get Started</Text>
          {!reduceMotion && (
            <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]} />
          )}
        </LinearGradient>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  darken: {
    ...fill,
    backgroundColor: 'rgba(8,8,10,0.42)',
  },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brand: { ...type.eyebrow, color: colors.ink, letterSpacing: 4 },

  // live indicator
  liveWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  liveRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.mint,
  },
  liveCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mint },

  gear: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,244,239,0.08)',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  hero: { flex: 1, justifyContent: 'center' },
  eyebrow: { ...type.eyebrow, color: colors.amber, marginBottom: spacing.lg },
  headline: { marginBottom: spacing.lg },
  hWord: {
    ...type.hero,
    color: colors.ink,
  },
  hAccent: { color: colors.coral, fontStyle: 'italic' },
  subcopy: {
    ...type.body,
    color: colors.inkMuted,
    maxWidth: 340,
    marginBottom: spacing.xl,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'rgba(246,244,239,0.04)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.mint,
  },
  featureText: { ...type.label, color: colors.ink, letterSpacing: 0.2 },
  ctaWrap: { paddingBottom: spacing.base, gap: spacing.md },

  // CTA
  ctaClip: {
    height: 60,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  ctaInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  ctaLabel: { ...type.headline, fontSize: 17, color: colors.black },
  sheen: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  hint: {
    ...type.caption,
    color: colors.amber,
    textAlign: 'center',
  },
});
