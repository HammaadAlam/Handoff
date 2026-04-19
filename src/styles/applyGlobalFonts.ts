/**
 * Default Text / TextInput to Poppins Regular so unstyled strings still match the app typeface.
 */
import { Text, TextInput } from 'react-native';
import { fonts } from '@/styles/fonts';

type WithDefaultProps = {
  defaultProps?: { style?: object };
};

export function applyGlobalFonts(): void {
  const T = Text as unknown as WithDefaultProps;
  const TI = TextInput as unknown as WithDefaultProps;
  T.defaultProps = { ...T.defaultProps, style: { fontFamily: fonts.regular } };
  TI.defaultProps = { ...TI.defaultProps, style: { fontFamily: fonts.regular } };
}
