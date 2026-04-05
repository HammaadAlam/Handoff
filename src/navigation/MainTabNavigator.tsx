/**
 * Main app shell — tab labels match marketplace mockups (Home, Search, List, Chat, Profile).
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CreateListingStackNavigator } from '@/navigation/CreateListingStackNavigator';
import { HomeScreen } from '@/screens/tabs/HomeScreen';
import { InboxScreen } from '@/screens/tabs/InboxScreen';
import { ProfileScreen } from '@/screens/tabs/ProfileScreen';
import { colors } from '@/styles/theme';
import { SearchStackNavigator } from './SearchStackNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcon = (name: keyof typeof Ionicons.glyphMap) => {
  return ({
    color,
    size,
  }: {
    color: string;
    size: number;
  }) => <Ionicons name={name} size={size} color={color} />;
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
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
        options={{ tabBarIcon: tabIcon('search-outline') }}
      />
      <Tab.Screen
        name="CreateListing"
        component={CreateListingStackNavigator}
        options={{
          tabBarLabel: 'List',
          tabBarIcon: tabIcon('add-circle-outline'),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarLabel: 'Chat',
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
