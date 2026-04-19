/**
 * Main app shell — tab labels match marketplace mockups (Home, Search, List, Chat, Profile).
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

const tabIcon = (
  outlinedName: keyof typeof Ionicons.glyphMap,
  filledName: keyof typeof Ionicons.glyphMap
) => {
  return ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => (
    <Ionicons name={focused ? filledName : outlinedName} size={size} color={color} />
  );
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{ tabBarIcon: tabIcon('search-outline', 'search') }}
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
          tabBarIcon: tabIcon('chatbubble-outline', 'chatbubble'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('person-outline', 'person') }}
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
    marginTop: -18,
  },
  fabWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
});
