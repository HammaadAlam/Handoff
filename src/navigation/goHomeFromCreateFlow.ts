/**
 * Reset the Create tab stack and switch tabs after posting a listing.
 * Shared across success-screen button actions so navigation behavior stays consistent.
 */
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CreateListingStackParamList, MainTabParamList } from './types';

function resetCreateStack(
  navigation: NativeStackNavigationProp<CreateListingStackParamList>,
) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'CreateEntry' }],
    }),
  );
}

export function goHomeFromCreateFlow(
  navigation: NativeStackNavigationProp<CreateListingStackParamList>,
) {
  resetCreateStack(navigation);
  const parent = navigation.getParent<
    NativeStackNavigationProp<MainTabParamList>
  >();
  parent?.navigate('Home');
}

export function goProfileFromCreateFlow(
  navigation: NativeStackNavigationProp<CreateListingStackParamList>,
) {
  resetCreateStack(navigation);
  const parent = navigation.getParent<
    NativeStackNavigationProp<MainTabParamList>
  >();
  parent?.navigate('Profile');
}
