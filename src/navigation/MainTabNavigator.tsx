/**
 * Main app shell — tab labels match marketplace mockups (Home, Search, List, Chat, Profile).
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { CompactTabBarLabel } from '@/components/navigation/CompactTabBarLabel';
import { CreateListingStackNavigator } from '@/navigation/CreateListingStackNavigator';
import { HomeScreen } from '@/screens/tabs/HomeScreen';
import { InboxScreen } from '@/screens/tabs/InboxScreen';
import { ProfileScreen } from '@/screens/tabs/ProfileScreen';
import { colors } from '@/styles/theme';
import { SearchStackNavigator } from './SearchStackNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabBarStyle = {
  backgroundColor: colors.surface,
  borderTopColor: colors.border,
};

function searchTabBarStyle(route: RouteProp<MainTabParamList, 'Search'>) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'SearchHome';
  return focusedRouteName === 'SearchQuery' ? { display: 'none' as const } : tabBarStyle;
}

const tabIcon = (outlinedName: keyof typeof Ionicons.glyphMap) => {
  return ({
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => (
    <Ionicons name={outlinedName} size={size} color={color} />
  );
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabel: CompactTabBarLabel,
        tabBarAllowFontScaling: false,
        tabBarItemStyle: {
          flex: 1,
          minWidth: 0,
          paddingHorizontal: 2,
        },
        tabBarIconStyle: { marginBottom: -2 },
        tabBarStyle,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('home-outline') }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={({ route }) => ({
          tabBarIcon: tabIcon('search-outline'),
          tabBarStyle: searchTabBarStyle(route),
        })}
      />
      <Tab.Screen
        name="CreateListing"
        component={CreateListingStackNavigator}
        options={{
          title: 'List',
          // Keep global labels enabled; suppress only this tab's built-in label
          // and render a custom label under the FAB icon.
          tabBarLabel: () => null,
          // This tab's icon includes its own label; don't apply the global icon
          // offset or the label baseline won't match the other tabs.
          tabBarIconStyle: styles.listTabIconStyle,
          tabBarIcon: ({ focused }) => (
            <View style={styles.listTabColumn}>
              <View
                style={[
                  styles.fabWrap,
                  focused && styles.fabWrapFocused,
                  styles.fabLift,
                ]}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          title: 'Chat',
          tabBarIcon: tabIcon('chatbubble-outline'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('person-outline') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  listTabIconStyle: {
    marginBottom: 0,
  },
  listTabColumn: {
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
  },
  fabLift: {
    marginTop: -20,
  },
  fabWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  fabWrapFocused: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.textPrimary,
  },
});
