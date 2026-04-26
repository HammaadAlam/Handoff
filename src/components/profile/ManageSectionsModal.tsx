/**
 * Manage profile tabs (Shop, Sale, About, Feedback): reorder, show/hide, Shop subsections.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  DEFAULT_SHOP_LAYOUT,
  PROFILE_TABS,
  type ProfileTab,
  type ShopSectionLayout,
} from '@/constants/profileTabs';
import type { ListingItem } from '@/data/mockData';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

const STORAGE_TABS = '@handoff_profile_tab_order';
const STORAGE_SHOP = '@handoff_profile_shop_layout';
const STORAGE_SHOP_SECTIONS_PREFIX = '@handoff_profile_shop_sections:';

export type CustomShopSection = {
  id: string;
  title: string;
  itemIds: string[];
};

export async function loadCustomShopSections(
  profileId: string | null,
): Promise<CustomShopSection[]> {
  if (!profileId) return [];
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_SHOP_SECTIONS_PREFIX}${profileId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is CustomShopSection =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as CustomShopSection).id === 'string' &&
          typeof (entry as CustomShopSection).title === 'string' &&
          Array.isArray((entry as CustomShopSection).itemIds),
      )
      .map((section) => ({
        ...section,
        itemIds: section.itemIds.filter((id): id is string => typeof id === 'string'),
      }));
  } catch {
    return [];
  }
}

function normalizeTabOrder(order: ProfileTab[]): ProfileTab[] {
  const seen = new Set<ProfileTab>();
  const out: ProfileTab[] = [];
  for (const t of order) {
    if (!seen.has(t) && PROFILE_TABS.includes(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  for (const t of PROFILE_TABS) {
    if (!seen.has(t)) out.push(t);
  }
  return out;
}

export async function loadProfileTabPreferences(): Promise<{
  tabOrder: ProfileTab[];
  shopLayout: ShopSectionLayout;
}> {
  try {
    const [rawTabs, rawShop] = await Promise.all([
      AsyncStorage.getItem(STORAGE_TABS),
      AsyncStorage.getItem(STORAGE_SHOP),
    ]);

    let tabOrder = [...PROFILE_TABS] as ProfileTab[];
    if (rawTabs) {
      const parsed = JSON.parse(rawTabs) as unknown;
      if (Array.isArray(parsed)) {
        const allowed = new Set(PROFILE_TABS as readonly string[]);
        const filtered = parsed.filter((t): t is ProfileTab =>
          typeof t === 'string' && allowed.has(t as ProfileTab),
        );
        if (filtered.length >= 1) {
          tabOrder = normalizeTabOrder(filtered);
        }
      }
    }

    let shopLayout: ShopSectionLayout = { ...DEFAULT_SHOP_LAYOUT };
    if (rawShop) {
      const parsed = JSON.parse(rawShop) as Partial<ShopSectionLayout>;
      shopLayout = {
        topPicks: parsed.topPicks !== false,
        newlyListed: parsed.newlyListed !== false,
        allItems: parsed.allItems !== false,
      };
    }

    return { tabOrder, shopLayout };
  } catch {
    return {
      tabOrder: [...PROFILE_TABS] as ProfileTab[],
      shopLayout: { ...DEFAULT_SHOP_LAYOUT },
    };
  }
}

type Props = {
  visible: boolean;
  onClose: () => void;
  tabOrder: ProfileTab[];
  shopLayout: ShopSectionLayout;
  onApply: (next: { tabOrder: ProfileTab[]; shopLayout: ShopSectionLayout }) => void;
  viewerProfileId: string | null;
  listings: ListingItem[];
  customSections: CustomShopSection[];
  onApplyCustomSections: (sections: CustomShopSection[]) => void;
};

export function ManageSectionsModal({
  visible,
  onClose,
  tabOrder,
  shopLayout,
  onApply,
  viewerProfileId,
  listings,
  customSections,
  onApplyCustomSections,
}: Props) {
  const [localSections, setLocalSections] = useState<CustomShopSection[]>(customSections);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setLocalSections(customSections);
      setExpandedSectionId(null);
      setNewSectionTitle('');
    }
  }, [visible, customSections]);

  const canManageCustomSections = !!viewerProfileId && listings.length > 0;

  const addCustomSection = () => {
    const title = newSectionTitle.trim();
    if (!title) return;
    if (localSections.some((section) => section.title.toLowerCase() === title.toLowerCase())) {
      Alert.alert('Section exists', 'A section with that name already exists.');
      return;
    }
    setLocalSections((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, itemIds: [] },
    ]);
    setNewSectionTitle('');
  };

  const removeCustomSection = (sectionId: string) => {
    setLocalSections((prev) => prev.filter((section) => section.id !== sectionId));
    setExpandedSectionId((prev) => (prev === sectionId ? null : prev));
  };

  const moveCustomSection = (sectionId: string, direction: 'up' | 'down') => {
    setLocalSections((prev) => {
      const index = prev.findIndex((section) => section.id === sectionId);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  const openMoveMenu = (sectionId: string) => {
    const sectionIndex = localSections.findIndex((section) => section.id === sectionId);
    if (sectionIndex === -1) return;
    const canMoveUp = sectionIndex > 0;
    const canMoveDown = sectionIndex < localSections.length - 1;
    Alert.alert(
      'Reorder section',
      'Move this section within your shop.',
      [
        {
          text: 'Move up',
          onPress: () => moveCustomSection(sectionId, 'up'),
          style: canMoveUp ? 'default' : 'cancel',
        },
        {
          text: 'Move down',
          onPress: () => moveCustomSection(sectionId, 'down'),
          style: canMoveDown ? 'default' : 'cancel',
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const toggleListingInSection = (sectionId: string, listingId: string) => {
    setLocalSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        const has = section.itemIds.includes(listingId);
        return {
          ...section,
          itemIds: has
            ? section.itemIds.filter((id) => id !== listingId)
            : [...section.itemIds, listingId],
        };
      }),
    );
  };

  const save = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_TABS, JSON.stringify(normalizeTabOrder(tabOrder))],
        [STORAGE_SHOP, JSON.stringify(shopLayout)],
        [
          `${STORAGE_SHOP_SECTIONS_PREFIX}${viewerProfileId ?? 'anonymous'}`,
          JSON.stringify(localSections),
        ],
      ]);
    } catch {
      // still apply in memory
    }
    onApply({ tabOrder: normalizeTabOrder(tabOrder), shopLayout: { ...shopLayout } });
    onApplyCustomSections(localSections);
    onClose();
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
            <View style={styles.lockedAllItemsRow}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={styles.lockedAllItemsTitle}>All items</Text>
              <Text style={styles.lockedAllItemsCount}>{listings.length} items</Text>
            </View>

            <View style={styles.customHeader}>
              <Text style={styles.customHeaderTitle}>Custom rows</Text>
              <Text style={styles.customHeaderSub}>
                Add rows like Featured Items or Top Picks and choose items for each row.
              </Text>
            </View>

            {!canManageCustomSections ? (
              <View style={styles.customEmptyCard}>
                <Text style={styles.customEmptyText}>
                  New users or users with no listings start empty here. Create listings first, then
                  add sections and assign items.
                </Text>
              </View>
            ) : (
              <>
                {localSections.map((section) => {
                  const expanded = expandedSectionId === section.id;
                  return (
                    <View key={section.id} style={styles.customSectionCard}>
                      <View style={styles.customSectionHeader}>
                        <Pressable
                          hitSlop={8}
                          style={styles.customSectionMove}
                          onPress={() => openMoveMenu(section.id)}
                        >
                          <Ionicons
                            name="reorder-three-outline"
                            size={20}
                            color={colors.textMuted}
                          />
                        </Pressable>
                        <Text style={styles.customSectionTitle}>{section.title}</Text>
                        <Pressable
                          style={styles.customSectionAddItemsBtn}
                          onPress={() =>
                            setExpandedSectionId((prev) =>
                              prev === section.id ? null : section.id,
                            )
                          }
                        >
                          <Text style={styles.customSectionAddItemsText}>
                            {section.itemIds.length > 0
                              ? `${section.itemIds.length} item${
                                  section.itemIds.length === 1 ? '' : 's'
                                }`
                              : 'Add Items'}
                          </Text>
                          <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.textPrimary}
                          />
                        </Pressable>
                        <Pressable
                          hitSlop={8}
                          onPress={() => removeCustomSection(section.id)}
                          style={styles.customSectionTrash}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
                        </Pressable>
                      </View>
                      {expanded ? (
                        <View style={styles.customSectionBody}>
                          {listings.map((listing) => {
                            const selected = section.itemIds.includes(listing.id);
                            return (
                              <Pressable
                                key={listing.id}
                                style={styles.customListingRow}
                                onPress={() => toggleListingInSection(section.id, listing.id)}
                              >
                                <Text style={styles.customListingTitle} numberOfLines={1}>
                                  {listing.title}
                                </Text>
                                <Ionicons
                                  name={selected ? 'checkbox' : 'square-outline'}
                                  size={18}
                                  color={selected ? colors.primary : colors.textMuted}
                                />
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  );
                })}

                <View style={styles.newSectionRow}>
                  <View style={styles.newSectionInputShell}>
                    <Ionicons name="add" size={20} color={colors.textPrimary} />
                    <TextInput
                      style={styles.newSectionInput}
                      value={newSectionTitle}
                      onChangeText={setNewSectionTitle}
                      placeholder="Add Section"
                      placeholderTextColor={colors.textMuted}
                      maxLength={32}
                      onSubmitEditing={addCustomSection}
                      returnKeyType="done"
                    />
                  </View>
                  <Pressable
                    style={[
                      styles.newSectionAddBtn,
                      !newSectionTitle.trim() && styles.newSectionAddBtnDisabled,
                    ]}
                    disabled={!newSectionTitle.trim()}
                    onPress={addCustomSection}
                  >
                    <Text style={styles.newSectionAddText}>Add</Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>

          <Pressable style={styles.saveBtn} onPress={save}>
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
  lockedAllItemsRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chipBg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  lockedAllItemsTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  lockedAllItemsCount: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  customHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  customHeaderTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  customHeaderSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  customEmptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.chipBg,
    marginBottom: spacing.sm,
  },
  customEmptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  customSectionCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  customSectionHeader: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    gap: 8,
  },
  customSectionMove: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSectionTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  customSectionAddItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customSectionAddItemsText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  customSectionTrash: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSectionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingVertical: 4,
  },
  customListingRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  customListingTitle: {
    flex: 1,
    marginRight: spacing.sm,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  newSectionRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 60,
  },
  newSectionInputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.xs,
  },
  newSectionInput: {
    flex: 1,
    minHeight: 40,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 18,
    backgroundColor: 'transparent',
  },
  newSectionAddBtn: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  newSectionAddBtnDisabled: {
    opacity: 0.4,
  },
  newSectionAddText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 14,
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
