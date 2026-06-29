import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { GrainOverlay } from '../components/GrainOverlay';
import { Button } from '../components/Button';
import { PressableScale } from '../components/PressableScale';
import { SettingsSheet } from '../components/SettingsSheet';
import { useCapture } from '../context/CaptureContext';
import { useSettings } from '../context/SettingsContext';
import { MODES, MODE_ORDER } from '../services/ai/prompts';
import { AnalysisMode } from '../services/ai/types';
import { modeColors } from '../theme/colors';
import { colors, fill, radius, spacing, type } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

const MODE_ICON: Record<AnalysisMode, keyof typeof Ionicons.glyphMap> = {
  academic: 'school-outline',
  safety: 'shield-checkmark-outline',
  inventory: 'cube-outline',
};

export function PreviewScreen({ navigation }: Props) {
  const { photo } = useCapture();
  const { hasGeminiKey } = useSettings();
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<AnalysisMode>('academic');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Size the preview to the photo's real aspect ratio so portrait AND
  // landscape captures both display fully (landscape stays horizontal).
  const aspect = photo?.width && photo?.height ? photo.width / photo.height : 3 / 4;
  const contentWidth = width - spacing.lg * 2;
  const imageHeight = Math.max(200, Math.min(contentWidth / aspect, height * 0.5));

  // Guard: if no photo (e.g. hot reload), return to camera.
  useEffect(() => {
    if (!photo) navigation.replace('Camera');
  }, [photo, navigation]);

  if (!photo) return <View style={styles.root} />;

  const accent = modeColors[selected];

  const onAnalyze = () => {
    if (!hasGeminiKey) {
      setSettingsOpen(true);
      return;
    }
    navigation.navigate('Results', { mode: selected });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GrainOverlay opacity={0.04} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header with a clear way back out of this screen */}
        <View style={styles.header}>
          <PressableScale
            haptic="light"
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </PressableScale>
          <Text style={styles.headerTitle}>Your photo</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image hero */}
          <Animated.View
            entering={FadeIn.duration(500)}
            style={[styles.imageWrap, { height: imageHeight }]}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(8,8,10,0.85)']}
              style={styles.imageScrim}
            />
            <PressableScale
              haptic="light"
              onPress={() => navigation.goBack()}
              style={styles.retake}
            >
              <Ionicons name="refresh" size={18} color={colors.ink} />
              <Text style={styles.retakeText}>Retake</Text>
            </PressableScale>
          </Animated.View>

          {/* Mode selection */}
          <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.eyebrow}>
            CHOOSE A MODE
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
            What do you want to know?
          </Animated.Text>

          <View style={styles.modes}>
            {MODE_ORDER.map((id, i) => {
              const meta = MODES[id];
              const c = modeColors[id];
              const active = selected === id;
              return (
                <Animated.View key={id} entering={FadeInUp.delay(300 + i * 90).duration(500)}>
                  <PressableScale
                    haptic="medium"
                    pressedScale={0.97}
                    onPress={() => setSelected(id)}
                    style={[
                      styles.modeCard,
                      active && { borderColor: c.key },
                    ]}
                  >
                    {active && (
                      <LinearGradient
                        colors={[`${c.key}26`, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={[styles.modeIcon, { backgroundColor: `${c.key}22` }]}>
                      <Ionicons name={MODE_ICON[id]} size={22} color={c.key} />
                    </View>
                    <View style={styles.modeText}>
                      <Text style={styles.modeTitle}>{meta.title}</Text>
                      <Text style={styles.modeDesc} numberOfLines={2}>
                        {meta.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        active && { borderColor: c.key, backgroundColor: c.key },
                      ]}
                    >
                      {active && <Ionicons name="checkmark" size={14} color={colors.black} />}
                    </View>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Pinned action so it's always reachable */}
        <View style={styles.ctaBar}>
          <Button
            label={`Run ${MODES[selected].title} Analysis`}
            gradient={accent.gradient}
            icon={<Ionicons name="sparkles" size={18} color={colors.black} />}
            onPress={onAnalyze}
          />
          {!hasGeminiKey && (
            <Text style={styles.warn}>Add a Gemini API key to analyze →</Text>
          )}
        </View>
      </SafeAreaView>

      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,244,239,0.06)',
  },
  headerTitle: { ...type.label, color: colors.ink },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  imageWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.lg,
  },
  image: { ...fill },
  imageScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  retake: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(8,8,10,0.6)',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  retakeText: { ...type.label, color: colors.ink },
  eyebrow: { ...type.eyebrow, color: colors.inkMuted },
  title: { ...type.title, color: colors.ink, marginTop: spacing.sm, marginBottom: spacing.lg },
  modes: { gap: spacing.md },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  modeIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: { flex: 1 },
  modeTitle: { ...type.headline, color: colors.ink },
  modeDesc: { ...type.caption, color: colors.inkMuted, marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.bg,
  },
  warn: { ...type.caption, color: colors.amber, textAlign: 'center' },
});
