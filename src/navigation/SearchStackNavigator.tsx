/**
 * Search tab = stack: landing → bottom search modal → category grid → filters modal.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoryResultsScreen } from '@/screens/search/CategoryResultsScreen';
import { FiltersScreen } from '@/screens/search/FiltersScreen';
import { SearchHomeScreen } from '@/screens/search/SearchHomeScreen';
import { SearchQueryScreen } from '@/screens/search/SearchQueryScreen';
import { colors } from '@/styles/theme';
import type { SearchStackParamList } from './types';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SearchHome" component={SearchHomeScreen} />
      <Stack.Screen
        name="SearchQuery"
        component={SearchQueryScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'none',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="CategoryResults" component={CategoryResultsScreen} />
      <Stack.Screen
        name="Filters"
        component={FiltersScreen}
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
