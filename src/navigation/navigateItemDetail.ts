/**
 * Opens ItemDetail on the root stack from any nested navigator (tab or search stack).
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ItemDetailParams, RootStackParamList } from './types';

export function navigateToItemDetail(
  navigation: NavigationProp<ParamListBase>,
  params: ItemDetailParams,
) {
  const parent = navigation.getParent();
  const root = (parent?.getParent() ?? parent) as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined;
  root?.navigate('ItemDetail', params);
}
