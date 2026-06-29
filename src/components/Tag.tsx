import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, type } from '../theme';

interface Props {
  label: string;
  accent?: string;
  filled?: boolean;
  style?: ViewStyle;
}

/** Small rounded pill for objects, activities, and metadata. */
export function Tag({ label, accent = colors.ink, filled, style }: Props) {
  return (
    <View
      style={[
        styles.tag,
        filled
          ? { backgroundColor: accent }
          : { borderWidth: 1, borderColor: 'rgba(246,244,239,0.16)' },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: filled ? colors.black : colors.ink },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...type.label, letterSpacing: 0.2 },
});
