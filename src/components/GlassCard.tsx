import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../theme';

interface Props extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  /** Border radius preset. */
  rounded?: keyof typeof radius;
  padded?: boolean;
  style?: ViewStyle;
}

/** Frosted glassmorphism surface used for cards and sheets. */
export function GlassCard({
  children,
  intensity = 28,
  rounded = 'lg',
  padded = true,
  style,
  ...rest
}: Props) {
  const r = radius[rounded];
  return (
    <View
      {...rest}
      style={[styles.wrap, { borderRadius: r }, padded && styles.padded, style]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={[StyleSheet.absoluteFill, { borderRadius: r }]}
      />
      <View style={[StyleSheet.absoluteFill, styles.tint, { borderRadius: r }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  padded: { padding: spacing.lg },
  tint: {
    backgroundColor: 'rgba(20,20,23,0.55)',
  },
});
