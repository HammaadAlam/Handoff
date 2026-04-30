/**
 * Root stack: main tabs + transaction flow (item → conversation → meetup).
 * Unauthenticated users see Login only.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { PersonalizationAboutScreen } from '@/screens/auth/PersonalizationAboutScreen';
import { PersonalizationInterestsScreen } from '@/screens/auth/PersonalizationInterestsScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { ConversationScreen } from '@/screens/transaction/ConversationScreen';
import { ItemDetailScreen } from '@/screens/transaction/ItemDetailScreen';
import { MeetupDetailsScreen } from '@/screens/transaction/MeetupDetailsScreen';
import { FavoritesScreen } from '@/screens/marketplace/FavoritesScreen';
import { EventCreateDetailsScreen } from '@/screens/events/EventCreateDetailsScreen';
import { EventCreatePreviewScreen } from '@/screens/events/EventCreatePreviewScreen';
import { EventCreateSuccessScreen } from '@/screens/events/EventCreateSuccessScreen';
import { EventsCalendarScreen } from '@/screens/events/EventsCalendarScreen';
import { ProfileSettingsScreen } from '@/screens/profile/ProfileSettingsScreen';
import { PublicProfileScreen } from '@/screens/profile/PublicProfileScreen';
import { fetchViewerPersonalization } from '@/services/personalization';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';
import { colors } from '@/styles/theme';
import { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

function ConversationRoute({
  route,
}: NativeStackScreenProps<RootStackParamList, 'Conversation'>) {
  const p = route.params;
  return (
    <ConversationScreen
      key={`${p.listingId}-${p.entry}-${p.offerAmount ?? ''}`}
    />
  );
}

export function RootNavigator() {
  const { session, authBypass, loading } = useAuth();
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!session?.user?.id || authBypass) {
        if (!cancelled) setNeedsOnboarding(false);
        return;
      }
      setOnboardingLoading(true);
      try {
        const personalization = await fetchViewerPersonalization(session.user.id);
        if (!cancelled) {
          const incomplete =
            personalization &&
            !personalization.onboardingCompleted &&
            !personalization.onboardingSkipped;
          setNeedsOnboarding(Boolean(incomplete));
        }
      } finally {
        if (!cancelled) setOnboardingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authBypass, session?.user?.id]);

  if (loading || onboardingLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session && !authBypass) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    );
  }

  if (needsOnboarding) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="PersonalizationAbout"
      >
        <Stack.Screen name="PersonalizationAbout" component={PersonalizationAboutScreen} />
        <Stack.Screen
          name="PersonalizationInterests"
          component={PersonalizationInterestsScreen}
        />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="EventsCalendar" component={EventsCalendarScreen} />
        <Stack.Screen name="EventCreateDetails" component={EventCreateDetailsScreen} />
        <Stack.Screen name="EventCreatePreview" component={EventCreatePreviewScreen} />
        <Stack.Screen name="EventCreateSuccess" component={EventCreateSuccessScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="Conversation" component={ConversationRoute} />
        <Stack.Screen name="MeetupDetails" component={MeetupDetailsScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        <Stack.Screen name="UserProfile" component={PublicProfileScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="PersonalizationAbout" component={PersonalizationAboutScreen} />
      <Stack.Screen
        name="PersonalizationInterests"
        component={PersonalizationInterestsScreen}
      />
      <Stack.Screen name="EventsCalendar" component={EventsCalendarScreen} />
      <Stack.Screen name="EventCreateDetails" component={EventCreateDetailsScreen} />
      <Stack.Screen name="EventCreatePreview" component={EventCreatePreviewScreen} />
      <Stack.Screen name="EventCreateSuccess" component={EventCreateSuccessScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="Conversation" component={ConversationRoute} />
      <Stack.Screen name="MeetupDetails" component={MeetupDetailsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="UserProfile" component={PublicProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
