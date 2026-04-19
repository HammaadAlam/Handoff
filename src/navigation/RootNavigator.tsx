/**
 * Root stack: main tabs + transaction flow (item → conversation → meetup).
 * Unauthenticated users see Login only.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { ConversationScreen } from '@/screens/transaction/ConversationScreen';
import { ItemDetailScreen } from '@/screens/transaction/ItemDetailScreen';
import { MeetupDetailsScreen } from '@/screens/transaction/MeetupDetailsScreen';
import { FavoritesScreen } from '@/screens/marketplace/FavoritesScreen';
import { ProfileSettingsScreen } from '@/screens/profile/ProfileSettingsScreen';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';
import { colors } from '@/styles/theme';

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

  if (loading) {
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

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="Conversation" component={ConversationRoute} />
      <Stack.Screen name="MeetupDetails" component={MeetupDetailsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
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
