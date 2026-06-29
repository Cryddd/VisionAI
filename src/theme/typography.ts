/**
 * Typography tokens.
 *
 * Display: Fraunces — a handcrafted, organic serif with warm, slightly
 * irregular forms (set with optical sizing for editorial headlines).
 * UI / body: Space Grotesk — a clean, modern, slightly technical sans.
 *
 * Font family names map to the keys registered in useAppFonts().
 */

export const fonts = {
  displayRegular: 'Fraunces_400Regular',
  displayMedium: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayBlack: 'Fraunces_900Black',
  displayItalic: 'Fraunces_400Regular_Italic',

  sans: 'SpaceGrotesk_400Regular',
  sansMedium: 'SpaceGrotesk_500Medium',
  sansSemiBold: 'SpaceGrotesk_600SemiBold',
  sansBold: 'SpaceGrotesk_700Bold',
} as const;

export const type = {
  hero: {
    fontFamily: fonts.displayBlack,
    fontSize: 64,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  display: {
    fontFamily: fonts.displayBold,
    fontSize: 44,
    lineHeight: 44,
    letterSpacing: -1,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  headline: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  // Brutalist all-caps eyebrow.
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 3,
  },
} as const;
