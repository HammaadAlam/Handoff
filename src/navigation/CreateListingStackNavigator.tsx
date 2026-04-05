/**
 * Sell tab stack: choose Quick List vs manual → camera / form → pickup → posted.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CameraCaptureScreen } from '@/screens/create/CameraCaptureScreen';
import { CreateEntryScreen } from '@/screens/create/CreateEntryScreen';
import { ListingDetailsScreen } from '@/screens/create/ListingDetailsScreen';
import { ListingSuccessScreen } from '@/screens/create/ListingSuccessScreen';
import { PickupLocationScreen } from '@/screens/create/PickupLocationScreen';
import { colors } from '@/styles/theme';
import type { CreateListingStackParamList } from './types';

const Stack = createNativeStackNavigator<CreateListingStackParamList>();

export function CreateListingStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="CreateEntry" component={CreateEntryScreen} />
      <Stack.Screen name="CameraCapture" component={CameraCaptureScreen} />
      <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} />
      <Stack.Screen name="PickupLocation" component={PickupLocationScreen} />
      <Stack.Screen
        name="ListingSuccess"
        component={ListingSuccessScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
