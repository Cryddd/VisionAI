import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Button } from './Button';
import { useSettings } from '../context/SettingsContext';
import { colors, fill, radius, spacing, type } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const GEMINI_KEY_URL = 'https://aistudio.google.com/app/apikey';

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // entrances
const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0); // exits

export function SettingsSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { config, update } = useSettings();

  // Keep the Modal mounted through the exit animation so the close
  // actually plays instead of snapping shut.
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  const [geminiKey, setGeminiKey] = useState(config.geminiApiKey);
  const [geminiModel, setGeminiModel] = useState(config.geminiModel);
  const [roboKey, setRoboKey] = useState(config.roboflowApiKey ?? '');
  const [roboModel, setRoboModel] = useState(config.roboflowModel ?? '');
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (visible) {
      setGeminiKey(config.geminiApiKey);
      setGeminiModel(config.geminiModel);
      setRoboKey(config.roboflowApiKey ?? '');
      setRoboModel(config.roboflowModel ?? '');
    }
  }, [visible, config]);

  const save = async () => {
    await update({
      geminiApiKey: geminiKey.trim(),
      geminiModel: geminiModel.trim() || 'gemini-2.5-flash',
      roboflowApiKey: roboKey.trim(),
      roboflowModel: roboModel.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      {visible && (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(200)}
          style={styles.backdrop}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
        pointerEvents="box-none"
      >
        {visible && (
        <Animated.View
          entering={SlideInDown.duration(340).easing(EASE_OUT)}
          exiting={SlideOutDown.duration(240)
            .easing(EASE_IN)
            .withCallback((finished) => {
              'worklet';
              if (finished) runOnJS(setMounted)(false);
            })}
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.grabber} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.eyebrow}>CONFIGURATION</Text>
            <Text style={styles.title}>API Keys</Text>
            <Text style={styles.subtitle}>
              VisionAI runs on Gemini Vision. Add your key to start analyzing.
            </Text>

            <Field label="Gemini API key" required>
              <View style={styles.keyRow}>
                <TextInput
                  value={geminiKey}
                  onChangeText={setGeminiKey}
                  placeholder="AIza…"
                  placeholderTextColor={colors.inkFaint}
                  secureTextEntry={!reveal}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { flex: 1 }]}
                />
                <Pressable onPress={() => setReveal((r) => !r)} hitSlop={10}>
                  <Text style={styles.reveal}>{reveal ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </Field>

            <Pressable onPress={() => Linking.openURL(GEMINI_KEY_URL)}>
              <Text style={styles.link}>Get a free Gemini API key →</Text>
            </Pressable>

            <Field label="Gemini model">
              <TextInput
                value={geminiModel}
                onChangeText={setGeminiModel}
                placeholder="gemini-2.5-flash"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </Field>

            <View style={styles.divider} />
            <Text style={styles.eyebrow}>OPTIONAL</Text>
            <Text style={styles.title}>Roboflow</Text>
            <Text style={styles.subtitle}>
              Add object detection with bounding boxes alongside Gemini.
            </Text>

            <Field label="Roboflow API key">
              <TextInput
                value={roboKey}
                onChangeText={setRoboKey}
                placeholder="rf_…"
                placeholderTextColor={colors.inkFaint}
                secureTextEntry={!reveal}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </Field>
            <Field label="Roboflow model (e.g. project/version)">
              <TextInput
                value={roboModel}
                onChangeText={setRoboModel}
                placeholder="coco/3"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </Field>

            <View style={{ height: spacing.lg }} />
            <Button label="Save" onPress={save} />
          </ScrollView>
        </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={{ color: colors.coral }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...fill, backgroundColor: 'rgba(0,0,0,0.6)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(246,244,239,0.2)',
    marginBottom: spacing.lg,
  },
  eyebrow: { ...type.eyebrow, color: colors.inkMuted, marginBottom: spacing.sm },
  title: { ...type.title, color: colors.ink },
  subtitle: {
    ...type.caption,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.base,
  },
  field: { marginBottom: spacing.base },
  fieldLabel: { ...type.label, color: colors.inkMuted, marginBottom: spacing.sm },
  input: {
    ...type.body,
    color: colors.ink,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reveal: { ...type.label, color: colors.violet },
  link: {
    ...type.caption,
    color: colors.violet,
    marginTop: -spacing.sm,
    marginBottom: spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: spacing.lg,
  },
});
