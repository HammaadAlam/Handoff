/**
 * Default Text / TextInput to Roboto Regular so unstyled strings still match the app typeface.
 */
import { Text, TextInput } from 'react-native';
import { fonts } from '@/styles/fonts';

type WithDefaultProps = {
  defaultProps?: { style?: object };
};

export function applyGlobalRoboto(): void {
  const T = Text as unknown as WithDefaultProps;
  const TI = TextInput as unknown as WithDefaultProps;
  T.defaultProps = { ...T.defaultProps, style: { fontFamily: fonts.regular } };
  TI.defaultProps = { ...TI.defaultProps, style: { fontFamily: fonts.regular } };
}
