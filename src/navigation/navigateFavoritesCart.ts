/**
 * Open Favorites / Cart on the root stack from tab or nested navigators.
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

function getRoot(
  navigation: NavigationProp<ParamListBase>,
): NativeStackNavigationProp<RootStackParamList> | undefined {
  const parent = navigation.getParent();
  return (parent?.getParent() ?? parent) as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined;
}

export function navigateToFavorites(navigation: NavigationProp<ParamListBase>) {
  getRoot(navigation)?.navigate('Favorites');
}

export function navigateToCart(navigation: NavigationProp<ParamListBase>) {
  getRoot(navigation)?.navigate('Cart');
}
