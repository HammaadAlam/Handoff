import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radii, spacing, typography } from '@/styles/theme';

type Props = {
  visible: boolean;
  title: string;
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export function OptionPickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>{title}</Text>
        <FlatList
          data={[...options]}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isOn = item === selected;
            return (
              <Pressable
                style={[styles.row, isOn && styles.rowOn]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[styles.rowText, isOn && styles.rowTextOn]}>
                  {item}
                </Text>
                {isOn ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          }}
        />
        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    maxHeight: '70%',
    bottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingBottom: spacing.sm,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  sheetTitle: {
    ...typography.header,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    color: colors.textPrimary,
  },
  list: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowOn: {
    backgroundColor: colors.bannerTint,
  },
  rowText: {
    ...typography.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowTextOn: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelText: {
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 16,
  },
});
