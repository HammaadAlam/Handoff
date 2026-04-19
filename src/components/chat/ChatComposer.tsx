/**
 * Auto-growing chat composer for conversation threads.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from 'react-native';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

type Props = {
  initialValue?: string;
  placeholder?: string;
  onSend: (text: string) => void | Promise<void>;
  onPlus?: () => void;
  disabled?: boolean;
};

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 120;

export function ChatComposer({
  initialValue = '',
  placeholder = 'Message...',
  onSend,
  onPlus,
  disabled,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [sending, setSending] = useState(false);

  const trimmed = value.trim();
  const canSend = !disabled && !sending && trimmed.length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    const toSend = trimmed;
    setSending(true);
    try {
      await onSend(toSend);
      setValue('');
      setHeight(MIN_HEIGHT);
      Keyboard.dismiss();
    } finally {
      setSending(false);
    }
  };

  const handleContentSize = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const next = Math.min(
      MAX_HEIGHT,
      Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height + 4),
    );
    setHeight(next);
  };

  const handlePlus = () => {
    if (onPlus) {
      onPlus();
      return;
    }
    Alert.alert('Attachments', 'Photo and offer attachments are coming soon.');
  };

  return (
    <View style={styles.composer}>
      <Pressable
        style={styles.plusBtn}
        onPress={handlePlus}
        accessibilityLabel="Add attachment"
        hitSlop={6}
      >
        <Ionicons name="add" size={22} color={colors.primary} />
      </Pressable>
      <TextInput
        style={[styles.input, { height }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={setValue}
        editable={!disabled && !sending}
        multiline
        scrollEnabled
        onContentSizeChange={handleContentSize}
        textAlignVertical="center"
        returnKeyType="default"
        blurOnSubmit={false}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.sendBtn,
          !canSend && styles.sendBtnDisabled,
          pressed && canSend && styles.sendBtnPressed,
        ]}
        accessibilityLabel="Send message"
        hitSlop={6}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? colors.textInverse : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    gap: 8,
    backgroundColor: colors.surface,
  },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
  sendBtnDisabled: {
    backgroundColor: colors.chipBg,
  },
});
