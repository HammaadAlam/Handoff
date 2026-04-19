/**
 * Auto-growing chat composer — single gray pill with camera, input, attach, send.
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
  /** Legacy name — attachment / paperclip action */
  onPlus?: () => void;
  disabled?: boolean;
};

const MIN_INPUT_HEIGHT = 40;
const MAX_INPUT_HEIGHT = 120;

const PILL_ICON_SIZE = 26;

const PILL_BG = '#F2F2F2';

export function ChatComposer({
  initialValue = '',
  placeholder = 'Type a message',
  onSend,
  onPlus,
  disabled,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
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
      setInputHeight(MIN_INPUT_HEIGHT);
      Keyboard.dismiss();
    } finally {
      setSending(false);
    }
  };

  const handleContentSize = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    const next = Math.min(
      MAX_INPUT_HEIGHT,
      Math.max(MIN_INPUT_HEIGHT, e.nativeEvent.contentSize.height + 4),
    );
    setInputHeight(next);
  };

  const handleAttach = () => {
    if (onPlus) {
      onPlus();
      return;
    }
    Alert.alert('Attachments', 'Photos and files are coming soon.');
  };

  const handleCamera = () => {
    Alert.alert('Camera', 'Taking a photo to attach is coming soon.');
  };

  const iconActive = colors.textPrimary;
  const iconMuted = colors.textMuted;

  return (
    <View style={styles.composer}>
      <View style={styles.pill}>
        <Pressable
          onPress={handleCamera}
          accessibilityLabel="Camera"
          hitSlop={6}
          style={styles.pillIconBtn}
        >
          <Ionicons name="camera-outline" size={PILL_ICON_SIZE} color={iconActive} />
        </Pressable>

        <TextInput
          style={[
            styles.input,
            { height: Math.min(inputHeight, MAX_INPUT_HEIGHT) },
          ]}
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
          onPress={handleAttach}
          accessibilityLabel="Attach file"
          hitSlop={6}
          style={styles.pillIconBtn}
        >
          <Ionicons name="attach-outline" size={PILL_ICON_SIZE} color={iconActive} />
        </Pressable>

        <Pressable
          onPress={() => void handleSend()}
          disabled={!canSend || sending}
          style={({ pressed }) => [
            styles.pillIconBtn,
            pressed && canSend && styles.pillIconPressed,
          ]}
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend || sending }}
          hitSlop={6}
        >
          <Ionicons
            name="send"
            size={PILL_ICON_SIZE}
            color={canSend ? iconActive : iconMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    paddingHorizontal: spacing.sm,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 44,
    minWidth: 0,
    backgroundColor: PILL_BG,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    maxHeight: MAX_INPUT_HEIGHT,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: spacing.xs,
    textAlign: 'left',
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  pillIconBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    minHeight: 36,
    marginBottom: Platform.OS === 'ios' ? 5 : 4,
  },
  pillIconPressed: {
    opacity: 0.7,
  },
});
