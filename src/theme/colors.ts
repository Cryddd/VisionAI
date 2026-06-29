/**
 * VisionAI color system — a premium, editorial dark palette.
 *
 * Base is a near-black warm ink; the signature is a living "neo-gradient"
 * built from a cohesive multi-hue set. Solid accents are pulled from the
 * same family so buttons / active states feel related to the background.
 */

export const palette = {
  // Surfaces
  void: '#08080A',
  bg: '#0A0A0B',
  surface: '#141417',
  surfaceHi: '#1C1C20',
  hairline: 'rgba(245,243,238,0.10)',

  // Ink
  ink: '#F6F4EF', // warm white
  inkMuted: '#A6A29A',
  inkFaint: '#6E6B64',

  // Neo-gradient family
  violet: '#7C5CFF',
  indigo: '#5B57FF',
  pink: '#FF5DA2',
  coral: '#FF7A45',
  amber: '#FFB35C',
  mint: '#3DDC97',
  cyan: '#34E7E4',
  lime: '#C8FF4D',

  // Feedback
  danger: '#FF5A5F',
  white: '#FFFFFF',
  black: '#000000',
} as const;

/** The signature living gradient used across landing + accents. */
export const neoGradient = [
  palette.violet,
  palette.pink,
  palette.coral,
  palette.amber,
] as const;

export const auroraGradient = [
  palette.indigo,
  palette.violet,
  palette.cyan,
  palette.mint,
] as const;

/** Per-analysis-mode identity colors. */
export const modeColors = {
  academic: {
    key: palette.violet,
    gradient: [palette.indigo, palette.violet, palette.pink] as const,
  },
  safety: {
    key: palette.coral,
    gradient: [palette.amber, palette.coral, palette.pink] as const,
  },
  inventory: {
    key: palette.mint,
    gradient: [palette.cyan, palette.mint, palette.lime] as const,
  },
} as const;

export const colors = palette;
