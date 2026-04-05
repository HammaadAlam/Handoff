/**
 * Opens Conversation on the root stack from tab screens (Inbox).
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConversationParams, RootStackParamList } from './types';

export function navigateToConversation(
  navigation: NavigationProp<ParamListBase>,
  params: ConversationParams,
) {
  const parent = navigation.getParent();
  const root = (parent?.getParent() ?? parent) as
    | NativeStackNavigationProp<RootStackParamList>
    | undefined;
  root?.navigate('Conversation', params);
}
