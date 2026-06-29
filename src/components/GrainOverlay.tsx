import React from 'react';
import { StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';

interface Props {
  /** Dot opacity (0–1). Keep low for a subtle analog grain. */
  opacity?: number;
  /** Spacing between halftone dots in px. */
  gap?: number;
  dotRadius?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * A static halftone dot texture used as an analog print / grain overlay.
 * Rendered via a single tiled SVG <Pattern> so it stays cheap full-screen.
 */
export function GrainOverlay({
  opacity = 0.06,
  gap = 6,
  dotRadius = 0.7,
  color = '#FFFFFF',
  style,
}: Props) {
  const { width, height } = useWindowDimensions();
  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, { opacity }, style]}
      pointerEvents="none"
    >
      <Defs>
        <Pattern
          id="halftone"
          x="0"
          y="0"
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <Circle cx={gap / 2} cy={gap / 2} r={dotRadius} fill={color} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill="url(#halftone)" />
    </Svg>
  );
}
