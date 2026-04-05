/**
 * Rounded pill input with leading Ionicons glyph.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, radii } from '@/styles/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = TextInputProps & {
  icon: IconName;
  error?: boolean;
};

export function InputField({ icon, error, style, ...rest }: Props) {
  return (
    <View style={[styles.field, error && styles.fieldError]}>
      <Ionicons
        name={icon}
        size={20}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  fieldError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
});
