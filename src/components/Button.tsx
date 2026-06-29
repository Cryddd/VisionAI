import React from 'react';
import { StyleSheet, Text, View, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './PressableScale';
import { colors, neoGradient, radius, spacing, type } from '../theme';

type Variant = 'primary' | 'glass' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Gradient colors for the primary variant. */
  gradient?: readonly string[];
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  gradient = neoGradient,
  icon,
  loading,
  disabled,
  fullWidth = true,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.black : colors.ink} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              isPrimary ? styles.labelDark : styles.labelLight,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={disabled || loading ? undefined : onPress}
      haptic={isPrimary ? 'medium' : 'light'}
      disabled={disabled || loading}
      style={[
        fullWidth && styles.fullWidth,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={gradient as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            variant === 'glass' ? styles.glass : styles.ghost,
          ]}
        >
          {content}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  glass: {
    backgroundColor: 'rgba(246,244,239,0.08)',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: { ...type.headline, fontSize: 17 },
  labelDark: { color: colors.black },
  labelLight: { color: colors.ink },
});
