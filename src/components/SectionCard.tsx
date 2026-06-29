import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radius, spacing, type } from '../theme';

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  index?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

/** A revealing content card with an accent header — the result building block. */
export function SectionCard({ title, icon, accent, index = 0, children, style }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(120 + index * 110)
        .duration(560)
        .springify()
        .damping(18)}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.eyebrow, color: colors.inkMuted, letterSpacing: 2 },
});
