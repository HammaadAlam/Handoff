/**
 * Reset the Create tab stack and switch to Home (after posting a listing).
 */
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CreateListingStackParamList } from './types';

export function goHomeFromCreateFlow(
  navigation: NativeStackNavigationProp<CreateListingStackParamList>,
) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'CreateEntry' }],
    }),
  );
  navigation.getParent()?.navigate('Home');
}
