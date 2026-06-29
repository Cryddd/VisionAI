export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/** Shared spring config for elastic, organic motion. */
export const springs = {
  soft: { damping: 18, stiffness: 140, mass: 1 },
  bouncy: { damping: 11, stiffness: 180, mass: 0.9 },
  snappy: { damping: 22, stiffness: 260, mass: 0.8 },
  press: { damping: 15, stiffness: 400, mass: 0.6 },
} as const;

/** Absolute-fill object usable in spreads (typed-safe across RN versions). */
export const fill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

export const timings = {
  fast: 220,
  base: 360,
  slow: 600,
  cinematic: 900,
} as const;
