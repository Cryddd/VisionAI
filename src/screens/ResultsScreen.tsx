import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { GrainOverlay } from '../components/GrainOverlay';
import { AnalysisLoader } from '../components/AnalysisLoader';
import { SectionCard } from '../components/SectionCard';
import { DetectionOverlay } from '../components/DetectionOverlay';
import { Button } from '../components/Button';
import { PressableScale } from '../components/PressableScale';
import { Tag } from '../components/Tag';
import { useAnalysis } from '../hooks/useAnalysis';
import { useCapture } from '../context/CaptureContext';
import { MODES } from '../services/ai/prompts';
import { modeColors } from '../theme/colors';
import { colors, fill, radius, spacing, type } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({ route, navigation }: Props) {
  const { mode } = route.params;
  const { photo, reset } = useCapture();
  const { status, result, error, retry } = useAnalysis(mode);
  const accent = modeColors[mode];

  const goHome = () => {
    reset();
    navigation.popToTop();
  };
  const newScan = () => {
    reset();
    navigation.navigate('Camera');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AnimatedGradient colors={[...accent.gradient, accent.key]} intensity={0.28} />
      <View style={styles.darken} pointerEvents="none" />
      <GrainOverlay opacity={0.05} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <PressableScale haptic="light" onPress={goHome} style={styles.headerBtn}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </PressableScale>
          <View style={[styles.modeBadge, { borderColor: accent.key }]}>
            <View style={[styles.modeDot, { backgroundColor: accent.key }]} />
            <Text style={styles.modeBadgeText}>{MODES[mode].title} Analysis</Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        {status === 'loading' && (
          <View style={styles.loaderWrap}>
            <AnalysisLoader gradient={accent.gradient} />
          </View>
        )}

        {status === 'error' && (
          <Animated.View entering={FadeIn} style={styles.errorWrap}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={36} color={colors.coral} />
            </View>
            <Text style={styles.errorTitle}>Analysis failed</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <View style={styles.errorCta}>
              <Button label="Try again" gradient={accent.gradient} onPress={retry} />
              <Button label="Retake photo" variant="ghost" onPress={newScan} />
            </View>
          </Animated.View>
        )}

        {status === 'success' && result && (
          <ResultsBody
            result={result}
            mode={mode}
            photoUri={photo?.uri}
            photoAspect={
              photo?.width && photo?.height ? photo.width / photo.height : 0.75
            }
            accentKey={accent.key}
            accentGradient={accent.gradient}
            onNewScan={newScan}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function ResultsBody({
  result,
  mode,
  photoUri,
  photoAspect,
  accentKey,
  accentGradient,
  onNewScan,
}: {
  result: import('../services/ai/types').AnalysisResult;
  mode: import('../services/ai/types').AnalysisMode;
  photoUri?: string;
  photoAspect: number;
  accentKey: string;
  accentGradient: readonly string[];
  onNewScan: () => void;
}) {
  const { width } = useWindowDimensions();
  const [showBoxes, setShowBoxes] = useState(true);
  const overlayWidth = width - spacing.lg * 2 - spacing.lg * 2;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero summary */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.heroCard}>
        <LinearGradient
          colors={[`${accentKey}33`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroRow}>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.thumb} contentFit="cover" />
          )}
          <View style={styles.heroText}>
            <Text style={styles.heroEyebrow}>RESULT</Text>
            <Text style={styles.heroHeadline}>{result.headline}</Text>
          </View>
        </View>
        <Text style={styles.heroSummary}>{result.summary}</Text>
      </Animated.View>

      {/* Objects */}
      <SectionCard title="OBJECTS" icon="cube-outline" accent={accentKey} index={1}>
        <View style={styles.objectList}>
          {result.objects.map((o, i) => (
            <View key={i} style={styles.objectRow}>
              <View style={[styles.bullet, { backgroundColor: accentKey }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.objectName}>{o.name}</Text>
                {!!o.detail && <Text style={styles.objectDetail}>{o.detail}</Text>}
              </View>
            </View>
          ))}
          {result.objects.length === 0 && (
            <Text style={styles.objectDetail}>No distinct objects identified.</Text>
          )}
        </View>
      </SectionCard>

      {/* Scene context */}
      <SectionCard title="SCENE CONTEXT" icon="image-outline" accent={accentKey} index={2}>
        <Text style={styles.paragraph}>{result.sceneContext}</Text>
      </SectionCard>

      {/* Activities */}
      <SectionCard title="ACTIVITIES" icon="pulse-outline" accent={accentKey} index={3}>
        <View style={styles.tagWrap}>
          {result.activities.map((a, i) => (
            <Tag key={i} label={a} />
          ))}
          {result.activities.length === 0 && (
            <Text style={styles.objectDetail}>No clear activity detected.</Text>
          )}
        </View>
      </SectionCard>

      {/* Recommendations */}
      <SectionCard
        title="RECOMMENDATIONS"
        icon="bulb-outline"
        accent={accentKey}
        index={4}
      >
        <View style={styles.recList}>
          {result.recommendations.map((r, i) => (
            <View key={i} style={styles.recRow}>
              <Text style={[styles.recNum, { color: accentKey }]}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Text style={styles.recText}>{r}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Optional Roboflow detections */}
      {result.detections && result.detections.length > 0 && photoUri && (
        <SectionCard
          title="OBJECT DETECTION"
          icon="scan-outline"
          accent={accentKey}
          index={5}
        >
          <PressableScale
            haptic="light"
            onPress={() => setShowBoxes((s) => !s)}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleText}>
              {showBoxes ? 'Hide boxes' : 'Show boxes'} · Roboflow
            </Text>
            <Ionicons
              name={showBoxes ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={colors.inkMuted}
            />
          </PressableScale>
          {showBoxes && (
            <View style={{ alignItems: 'center', marginBottom: spacing.base }}>
              <DetectionOverlay
                uri={photoUri}
                detections={result.detections}
                width={overlayWidth}
                aspectRatio={photoAspect}
                accent={accentKey}
              />
            </View>
          )}
          <View style={styles.tagWrap}>
            {result.detections.map((d, i) => (
              <Tag
                key={i}
                label={`${d.label} ${Math.round(d.confidence * 100)}%`}
                accent={accentKey}
              />
            ))}
          </View>
        </SectionCard>
      )}

      {/* Footer */}
      <Animated.Text entering={FadeIn.delay(700)} style={styles.modelNote}>
        Analyzed with {result.model}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(640).duration(500)} style={styles.footerCta}>
        <Button
          label="New Scan"
          gradient={accentGradient}
          icon={<Ionicons name="scan-outline" size={18} color={colors.black} />}
          onPress={onNewScan}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  darken: { ...fill, backgroundColor: 'rgba(8,8,10,0.7)' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,244,239,0.06)',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  modeDot: { width: 7, height: 7, borderRadius: 4 },
  modeBadgeText: { ...type.label, color: colors.ink },

  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,90,95,0.12)',
    marginBottom: spacing.lg,
  },
  errorTitle: { ...type.title, color: colors.ink, marginBottom: spacing.sm },
  errorBody: { ...type.body, color: colors.inkMuted, textAlign: 'center', marginBottom: spacing.xl },
  errorCta: { width: '100%', gap: spacing.md },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.base },

  heroCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  thumb: { width: 64, height: 64, borderRadius: radius.md },
  heroText: { flex: 1 },
  heroEyebrow: { ...type.eyebrow, color: colors.inkMuted, marginBottom: spacing.xs },
  heroHeadline: { ...type.title, fontSize: 26, lineHeight: 28, color: colors.ink },
  heroSummary: { ...type.body, color: colors.inkMuted, marginTop: spacing.base },

  objectList: { gap: spacing.md },
  objectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bullet: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  objectName: { ...type.bodyMedium, color: colors.ink },
  objectDetail: { ...type.caption, color: colors.inkMuted, marginTop: 1 },

  paragraph: { ...type.body, color: colors.inkMuted },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  recList: { gap: spacing.base },
  recRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  recNum: { ...type.headline, fontSize: 16 },
  recText: { ...type.body, color: colors.ink, flex: 1 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  toggleText: { ...type.label, color: colors.inkMuted },

  modelNote: {
    ...type.caption,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footerCta: { marginTop: spacing.md },
});
