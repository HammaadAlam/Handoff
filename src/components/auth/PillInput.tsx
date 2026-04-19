/**
 * Rounded input row used across the auth flow (icon prefix + light purple bg).
 */
import { Ionicons } from '@expo/vector-icons';
import { TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { authColors, authStyles } from '@/screens/auth/authTheme';

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle | ViewStyle[];
};

export function PillInput({ icon, containerStyle, style, ...rest }: Props) {
  return (
    <View style={[authStyles.inputRow, containerStyle]}>
      <Ionicons
        name={icon}
        size={18}
        color={authColors.iconTint}
        style={authStyles.inputIcon}
      />
      <TextInput
        style={[authStyles.inputField, style]}
        placeholderTextColor={authColors.inputPlaceholder}
        {...rest}
      />
    </View>
  );
}
