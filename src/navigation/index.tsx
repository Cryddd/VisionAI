import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { LandingScreen } from '../screens/LandingScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { ResultsScreen } from '../screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0B' },
        animation: 'fade',
        animationDuration: 320,
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ animation: 'fade_from_bottom', animationDuration: 360 }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ animation: 'slide_from_right', animationDuration: 380 }}
      />
    </Stack.Navigator>
  );
}
