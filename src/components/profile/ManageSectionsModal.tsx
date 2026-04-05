/**
 * Bottom-sheet style modal — organize Featured / Best Sellers (profile mockup).
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { PLACEHOLDER_IMAGE_URI } from '@/data/mockData';
import { colors, radii, spacing, typography } from '@/styles/theme';

type SectionRow = { id: string; title: string; itemLabel: string };

const INITIAL: SectionRow[] = [
  { id: 'f', title: 'Featured Items', itemLabel: '0/8 Items' },
  { id: 'b', title: 'Best Sellers', itemLabel: 'Add Items' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ManageSectionsModal({ visible, onClose }: Props) {
  const [sections, setSections] = useState<SectionRow[]>(INITIAL);

  const removeSection = (id: string) => {
    setSections((s) => s.filter((row) => row.id !== id));
  };

  const addSection = () => {
    setSections((s) => [
      ...s,
      {
        id: `s-${Date.now()}`,
        title: 'New Section',
        itemLabel: 'Add Items',
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Manage Sections</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScroll}
          >
            {sections.map((sec) => (
              <View key={sec.id} style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="reorder-two-outline"
                    size={26}
                    color={colors.textMuted}
                  />
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  <Pressable style={styles.addItemsBtn}>
                    <Text style={styles.addItemsText}>{sec.itemLabel}</Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.primary}
                    />
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() => removeSection(sec.id)}
                    style={styles.trashBtn}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </Pressable>
                </View>

                {sec.id === 'f' && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.uploadRow}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <View key={i} style={styles.uploadSlot}>
                        <RemoteImage
                          uri={PLACEHOLDER_IMAGE_URI}
                          style={styles.uploadPh}
                          contentFit="cover"
                        />
                        <View style={styles.uploadOverlay}>
                          <Ionicons
                            name="image-outline"
                            size={24}
                            color={colors.primary}
                          />
                          <Text style={styles.uploadLabel}>Upload Photo</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}

            <Pressable style={styles.addSectionRow} onPress={addSection}>
              <Ionicons name="add" size={22} color={colors.primary} />
              <Text style={styles.addSectionText}>Add Section</Text>
            </Pressable>
          </ScrollView>

          <Pressable style={styles.saveBtn} onPress={onClose}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    ...typography.header,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  sheetScroll: {
    paddingBottom: spacing.md,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addItemsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.link,
  },
  trashBtn: {
    marginLeft: 4,
  },
  uploadRow: {
    gap: 10,
    paddingVertical: 4,
  },
  uploadSlot: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
    marginRight: 10,
  },
  uploadPh: {
    ...StyleSheet.absoluteFillObject,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  addSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addSectionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnText: {
    ...typography.button,
    color: '#FFF',
  },
});
