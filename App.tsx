import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DarkTheme,
  Theme,
} from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { RootNavigator } from './src/navigation';
import { SettingsProvider } from './src/context/SettingsContext';
import { CaptureProvider } from './src/context/CaptureContext';
import { AnimatedGradient } from './src/components/AnimatedGradient';
import { useAppFonts } from './src/hooks/useAppFonts';
import { colors, fill, neoGradient } from './src/theme';

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.ink,
    primary: colors.violet,
    border: colors.hairline,
  },
};

export default function App() {
  const fontsLoaded = useAppFonts();

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SettingsProvider>
          <CaptureProvider>
            {fontsLoaded ? (
              <NavigationContainer theme={navTheme}>
                <RootNavigator />
              </NavigationContainer>
            ) : (
              <View style={styles.splash}>
                <AnimatedGradient colors={[...neoGradient]} intensity={0.8} />
                <Animated.View entering={FadeIn} style={styles.splashScrim} />
              </View>
            )}
          </CaptureProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: { flex: 1, backgroundColor: colors.bg },
  splashScrim: {
    ...fill,
    backgroundColor: 'rgba(8,8,10,0.4)',
  },
});
