import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  /** Vertical float amplitude in px. */
  amplitude?: number;
  duration?: number;
  delay?: number;
  /** Subtle rotation sway in degrees. */
  rotate?: number;
  style?: ViewStyle;
}

/** Wraps children in a soft, continuous floating + sway motion. */
export function Floating({
  children,
  amplitude = 10,
  duration = 3200,
  delay = 0,
  rotate = 0,
  style,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
  }, [delay, duration, t]);

  const animStyle = useAnimatedStyle(() => {
    const p = t.value;
    return {
      transform: [
        { translateY: -amplitude + p * amplitude * 2 },
        { rotateZ: `${(-rotate + p * rotate * 2).toFixed(3)}deg` },
      ],
    };
  });

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}
