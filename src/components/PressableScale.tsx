import React, { useCallback } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { springs } from '../theme';

const AView = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  children: React.ReactNode;
  /** Scale at full press. */
  pressedScale?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  style?: StyleProp<ViewStyle>;
}

/**
 * A pressable that springs down elastically and fires a haptic on press —
 * the base for every tappable surface, giving consistent tactile feedback.
 */
export function PressableScale({
  children,
  pressedScale = 0.95,
  haptic = 'light',
  onPressIn,
  onPress,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(pressedScale, springs.press);
      if (haptic !== 'none') {
        const map = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        } as const;
        Haptics.impactAsync(map[haptic]).catch(() => {});
      }
      onPressIn?.(e);
    },
    [haptic, onPressIn, pressedScale, scale]
  );

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.bouncy);
  }, [scale]);

  return (
    <AView
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, animStyle]}
    >
      {children}
    </AView>
  );
}
