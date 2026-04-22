/**
 * Opens public user profile from any nested navigator and routes to the
 * current user's Profile tab when the tapped user is self.
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

type TargetUser = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  handle?: string;
};

export function navigateToUserProfile(
  navigation: NavigationProp<ParamListBase>,
  target: TargetUser,
  viewerProfileId?: string | null
) {
  const parent = navigation.getParent();
  const root = ((parent?.getParent() ?? parent ?? navigation) as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined);
  if (!root) return;

  if (viewerProfileId && viewerProfileId === target.userId) {
    root.navigate('Main', { screen: 'Profile' });
    return;
  }

  root.navigate('UserProfile', {
    userId: target.userId,
    displayName: target.displayName,
    avatarUrl: target.avatarUrl,
    handle: target.handle,
  });
}
