import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { LandingScreen } from '../screens/LandingScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { ResultsScreen } from '../screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Each transition reflects the direction of travel through the flow:
 *  Landing → Camera   : crossfade into "camera mode"
 *  Camera  → Preview  : the captured photo rises up like a sheet
 *  Preview → Results  : push forward into the analysis
 * Swipe-back gestures mirror each entrance for a natural feel.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0B' },
        animation: 'fade',
        animationDuration: 320,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ animation: 'fade', animationDuration: 300 }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 360,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 380,
          fullScreenGestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
