/**
 * Home Stack Navigator — React Navigation stack.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeCategoryResultsScreen } from '@/screens/home/HomeCategoryResultsScreen';
import { HomeFiltersScreen } from '@/screens/home/HomeFiltersScreen';
import { HomeScreen } from '@/screens/tabs/HomeScreen';
import { colors } from '@/styles/theme';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeLanding" component={HomeScreen} />
      <Stack.Screen name="CategoryResults" component={HomeCategoryResultsScreen} />
      <Stack.Screen
        name="Filters"
        component={HomeFiltersScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
