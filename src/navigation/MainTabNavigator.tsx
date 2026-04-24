/**
 * Main app shell — tab labels match marketplace mockups (Home, Search, List, Chat, Profile).
 */
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  createBottomTabNavigator,
  type BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from '@react-navigation/native';
import { Pressable, StyleSheet, View } from 'react-native';
import { CompactTabBarLabel } from '@/components/navigation/CompactTabBarLabel';
import { CreateListingStackNavigator } from '@/navigation/CreateListingStackNavigator';
import { InboxScreen } from '@/screens/tabs/InboxScreen';
import { ProfileScreen } from '@/screens/tabs/ProfileScreen';
import { colors } from '@/styles/theme';
import { HomeStackNavigator } from './HomeStackNavigator';
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

function createListingTabBarStyle(route: RouteProp<MainTabParamList, 'CreateListing'>) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'CreateEntry';
  return focusedRouteName === 'CreateEntry' ? tabBarStyle : { display: 'none' as const };
}

const tabIcon = (
  outlinedName: keyof typeof Ionicons.glyphMap,
  filledName: keyof typeof Ionicons.glyphMap,
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
    <Ionicons
      name={focused ? filledName : outlinedName}
      size={size}
      color={focused ? colors.textPrimary : color}
    />
  );
};

function ListTabButton(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityState={props.accessibilityState}
      accessibilityRole={props.accessibilityRole}
      accessibilityLabel={props.accessibilityLabel}
      testID={props.testID}
      onLongPress={props.onLongPress}
      onPress={(event) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPress?.(event);
      }}
      style={({ pressed }) => [props.style, pressed && styles.listTabButtonPressed]}
    >
      {props.children}
    </Pressable>
  );
}

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
        component={HomeStackNavigator}
        options={{ tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={({ route }) => ({
          tabBarIcon: tabIcon('search-outline', 'search'),
          tabBarStyle: searchTabBarStyle(route),
        })}
      />
      <Tab.Screen
        name="CreateListing"
        component={CreateListingStackNavigator}
        options={({ route }) => ({
          title: 'List',
          // Keep global labels enabled; suppress only this tab's built-in label
          // and render a custom label under the FAB icon.
          tabBarLabel: () => null,
          // This tab's icon includes its own label; don't apply the global icon
          // offset or the label baseline won't match the other tabs.
          tabBarIconStyle: styles.listTabIconStyle,
          tabBarButton: (props) => <ListTabButton {...props} />,
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
          tabBarStyle: createListingTabBarStyle(route),
        })}
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
    marginTop: -20,
  },
  fabWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  fabWrapFocused: {
    backgroundColor: colors.primaryDark,
  },
  listTabButtonPressed: {
    opacity: 0.96,
  },
});
