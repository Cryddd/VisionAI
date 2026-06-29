import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { GrainOverlay } from '../components/GrainOverlay';
import { Button } from '../components/Button';
import { Floating } from '../components/Floating';
import { PressableScale } from '../components/PressableScale';
import { SettingsSheet } from '../components/SettingsSheet';
import { useSettings } from '../context/SettingsContext';
import { RootStackParamList } from '../navigation/types';
import { colors, fill, neoGradient, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const FEATURES = ['Objects', 'Context', 'Activities', 'Recommendations'];

export function LandingScreen({ navigation }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { hasGeminiKey } = useSettings();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AnimatedGradient colors={[...neoGradient]} intensity={0.9} />
      <View style={styles.darken} pointerEvents="none" />
      <GrainOverlay opacity={0.05} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top bar */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.topBar}>
          <Text style={styles.brand}>VISIONAI</Text>
          <PressableScale
            haptic="light"
            onPress={() => setSettingsOpen(true)}
            style={styles.gear}
          >
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </PressableScale>
        </Animated.View>

        {/* Floating decorative orb */}
        <Floating amplitude={16} rotate={6} style={styles.decor}>
          <View style={styles.decorRing} />
        </Floating>

        {/* Hero */}
        <View style={styles.hero}>
          <Animated.Text
            entering={FadeInDown.delay(150).duration(700)}
            style={styles.eyebrow}
          >
            GEMINI · VISION · INTELLIGENCE
          </Animated.Text>

          <View style={styles.headline}>
            <Animated.Text entering={FadeInDown.delay(280).duration(700)} style={styles.hWord}>
              Point.
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(400).duration(700)} style={styles.hWord}>
              Capture.
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(520).duration(700)}
              style={[styles.hWord, styles.hAccent]}
            >
              Understand.
            </Animated.Text>
          </View>

          <Animated.Text
            entering={FadeInDown.delay(640).duration(700)}
            style={styles.subcopy}
          >
            VisionAI reads any scene through Gemini Vision — naming the objects,
            the context, the activity, and what to do next.
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(760).duration(700)}
            style={styles.features}
          >
            {FEATURES.map((f) => (
              <View key={f} style={styles.featurePill}>
                <View style={styles.dot} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(700)}
          style={styles.ctaWrap}
        >
          <Button
            label="Get Started"
            gradient={neoGradient}
            icon={<Ionicons name="scan-outline" size={20} color={colors.black} />}
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
  brand: { ...type.eyebrow, color: colors.ink, letterSpacing: 4 },
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
  decor: {
    position: 'absolute',
    right: -40,
    top: 90,
  },
  decorRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(246,244,239,0.18)',
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
  hint: {
    ...type.caption,
    color: colors.amber,
    textAlign: 'center',
  },
});
