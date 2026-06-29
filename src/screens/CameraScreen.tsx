import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedGradient } from '../components/AnimatedGradient';
import { GrainOverlay } from '../components/GrainOverlay';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { PressableScale } from '../components/PressableScale';
import { useCapture } from '../context/CaptureContext';
import { prepareForAnalysis } from '../utils/image';
import { RootStackParamList } from '../navigation/types';
import { colors, fill, neoGradient, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setPhoto, setResult } = useCapture();

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturing, setCapturing] = useState(false);
  const [ready, setReady] = useState(false);

  // Request permission automatically on first mount.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    try {
      const shot = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!shot?.uri) throw new Error('Capture failed');
      const prepared = await prepareForAnalysis(shot.uri);
      setResult(null);
      setPhoto(prepared);
      navigation.navigate('Preview');
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setCapturing(false);
    }
  };

  // ---- Permission states -------------------------------------------------
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <AnimatedGradient colors={[...neoGradient]} intensity={0.7} />
        <View style={styles.darken} pointerEvents="none" />
        <GrainOverlay opacity={0.05} />
        <SafeAreaView style={styles.permWrap}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.permIcon}>
            <Ionicons name="camera-outline" size={40} color={colors.ink} />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(120).duration(600)} style={styles.permTitle}>
            Camera access
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220).duration(600)} style={styles.permBody}>
            VisionAI needs your camera to capture a photo and analyze what's in
            the frame. Nothing is stored without your action.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(340).duration(600)} style={styles.permCta}>
            <Button
              label={permission.canAskAgain ? 'Allow Camera' : 'Open Settings'}
              onPress={requestPermission}
              icon={<Ionicons name="lock-open-outline" size={20} color={colors.black} />}
            />
            <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // ---- Live camera -------------------------------------------------------
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
      />

      {/* Subtle vignette for legibility */}
      <View style={styles.vignette} pointerEvents="none" />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Top controls */}
        <View style={styles.topBar}>
          <CircleButton icon="chevron-back" onPress={() => navigation.goBack()} />
          <View style={styles.topRight}>
            <CircleButton
              icon={flash === 'off' ? 'flash-off' : 'flash'}
              active={flash !== 'off'}
              onPress={() =>
                setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'))
              }
            />
          </View>
        </View>

        {/* Center framing brackets + scan line */}
        <View style={styles.frameWrap} pointerEvents="none">
          <Frame />
          {ready && <ScanLine />}
          <Animated.Text entering={FadeIn.delay(400)} style={styles.frameHint}>
            Frame your subject
          </Animated.Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <View style={styles.sideSlot} />
          <Shutter onPress={capture} busy={capturing} />
          <View style={styles.sideSlot}>
            <CircleButton
              icon="camera-reverse-outline"
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// --- Sub-components --------------------------------------------------------

function CircleButton({
  icon,
  onPress,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <PressableScale onPress={onPress} haptic="light">
      {active ? (
        <View style={[styles.circleBtn, styles.circleBtnActive]}>
          <Ionicons name={icon} size={22} color={colors.black} />
        </View>
      ) : (
        <GlassCard rounded="pill" padded={false} intensity={36} style={styles.circleBtn}>
          <Ionicons name={icon} size={22} color={colors.ink} />
        </GlassCard>
      )}
    </PressableScale>
  );
}

function Shutter({ onPress, busy }: { onPress: () => void; busy: boolean }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <PressableScale
      haptic="none"
      pressedScale={1}
      onPressIn={() => (scale.value = withTiming(0.88, { duration: 120 }))}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 220, easing: Easing.elastic(1.4) });
      }}
      onPress={onPress}
      disabled={busy}
    >
      <View style={styles.shutterRing}>
        <Animated.View style={[styles.shutterCore, style]}>
          {busy ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Animated.View>
      </View>
    </PressableScale>
  );
}

function Frame() {
  const corners = [
    { top: 0, left: 0, rotate: '0deg' },
    { top: 0, right: 0, rotate: '90deg' },
    { bottom: 0, right: 0, rotate: '180deg' },
    { bottom: 0, left: 0, rotate: '270deg' },
  ];
  return (
    <View style={styles.frame}>
      {corners.map((c, i) => (
        <View
          key={i}
          style={[styles.corner, c as any, { transform: [{ rotate: c.rotate }] }]}
        />
      ))}
    </View>
  );
}

function ScanLine() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: t.value * (FRAME_SIZE - 4) }],
    opacity: 0.5 + t.value * 0.3,
  }));
  return <Animated.View style={[styles.scanLine, style]} />;
}

const FRAME_SIZE = 260;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  darken: { ...fill, backgroundColor: 'rgba(8,8,10,0.5)' },
  vignette: {
    ...fill,
    borderWidth: 80,
    borderColor: 'rgba(0,0,0,0.28)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },

  // permission
  permWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  permIcon: {
    width: 84,
    height: 84,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,244,239,0.08)',
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.lg,
  },
  permTitle: { ...type.title, color: colors.ink, marginBottom: spacing.sm },
  permBody: { ...type.body, color: colors.inkMuted, marginBottom: spacing.xl },
  permCta: { gap: spacing.md },

  // top
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  topRight: { flexDirection: 'row', gap: spacing.md },
  circleBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnActive: {
    backgroundColor: colors.amber,
    borderWidth: 1,
    borderColor: colors.amber,
  },

  // frame
  frameWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.ink,
    borderTopLeftRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    top: FRAME_SIZE / 2 - FRAME_SIZE / 2,
    width: FRAME_SIZE - 8,
    alignSelf: 'center',
    height: 2,
    backgroundColor: colors.mint,
    borderRadius: 2,
    shadowColor: colors.mint,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  frameHint: {
    ...type.label,
    color: colors.ink,
    marginTop: spacing.lg,
    opacity: 0.8,
  },

  // bottom
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.base,
  },
  sideSlot: { width: 64, alignItems: 'center' },
  shutterRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.ink,
  },
});
