/**
 * Root stack: main tabs + transaction flow (item → conversation → meetup).
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConversationScreen } from '@/screens/transaction/ConversationScreen';
import { ItemDetailScreen } from '@/screens/transaction/ItemDetailScreen';
import { MeetupDetailsScreen } from '@/screens/transaction/MeetupDetailsScreen';
import { CartScreen } from '@/screens/marketplace/CartScreen';
import { FavoritesScreen } from '@/screens/marketplace/FavoritesScreen';
import { ProfileSettingsScreen } from '@/screens/profile/ProfileSettingsScreen';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="MeetupDetails" component={MeetupDetailsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
    </Stack.Navigator>
  );
}
