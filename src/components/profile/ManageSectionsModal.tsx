/**
 * Manage profile tabs (Shop, Sale, About, Feedback): reorder, show/hide, Shop subsections.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  DEFAULT_SHOP_LAYOUT,
  PROFILE_TABS,
  type ProfileTab,
  type ShopSectionLayout,
} from '@/constants/profileTabs';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

const STORAGE_TABS = '@handoff_profile_tab_order';
const STORAGE_SHOP = '@handoff_profile_shop_layout';

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

function tabActionLabel(tab: ProfileTab): string {
  switch (tab) {
    case 'Shop':
      return 'Storefront';
    case 'Sale':
      return 'Promotions';
    case 'About':
      return 'Bio';
    case 'Feedback':
      return 'Reviews';
    default:
      return '';
  }
}

type Props = {
  visible: boolean;
  onClose: () => void;
  tabOrder: ProfileTab[];
  shopLayout: ShopSectionLayout;
  onApply: (next: { tabOrder: ProfileTab[]; shopLayout: ShopSectionLayout }) => void;
  /** Featured carousel count for Shop row label */
  featuredCount: number;
  saleListingCount: number;
};

export function ManageSectionsModal({
  visible,
  onClose,
  tabOrder,
  shopLayout,
  onApply,
  featuredCount,
  saleListingCount,
}: Props) {
  const [localTabs, setLocalTabs] = useState<ProfileTab[]>(tabOrder);
  const [localShop, setLocalShop] = useState<ShopSectionLayout>(shopLayout);
  const [expandedTab, setExpandedTab] = useState<ProfileTab | null>(null);

  useEffect(() => {
    if (visible) {
      setLocalTabs([...tabOrder]);
      setLocalShop({ ...shopLayout });
      setExpandedTab(null);
    }
  }, [visible, tabOrder, shopLayout]);

  const toggleExpand = useCallback((tab: ProfileTab) => {
    setExpandedTab((e) => (e === tab ? null : tab));
  }, []);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setLocalTabs((rows) => {
      const next = [...rows];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setLocalTabs((rows) => {
      if (index >= rows.length - 1) return rows;
      const next = [...rows];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const removeTab = (id: ProfileTab) => {
    if (localTabs.length <= 1) {
      Alert.alert('Manage sections', 'Keep at least one tab visible.');
      return;
    }
    setLocalTabs((rows) => rows.filter((t) => t !== id));
    if (expandedTab === id) setExpandedTab(null);
  };

  const addHiddenTab = () => {
    const hidden = PROFILE_TABS.filter((t) => !localTabs.includes(t));
    if (hidden.length === 0) {
      Alert.alert('Manage sections', 'All tabs are already visible.');
      return;
    }
    Alert.alert(
      'Add tab',
      'Choose a tab to show again.',
      [
        ...hidden.map((t) => ({
          text: t,
          onPress: () => setLocalTabs((prev) => normalizeTabOrder([...prev, t])),
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const rightLabel = (tab: ProfileTab): string => {
    switch (tab) {
      case 'Shop':
        return `${Math.min(featuredCount, 8)}/8 items`;
      case 'Sale':
        return `${saleListingCount} listings`;
      case 'About':
        return tabActionLabel(tab);
      case 'Feedback':
        return tabActionLabel(tab);
      default:
        return '';
    }
  };

  const save = async () => {
    const order = normalizeTabOrder(localTabs);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_TABS, JSON.stringify(order)],
        [STORAGE_SHOP, JSON.stringify(localShop)],
      ]);
    } catch {
      // still apply in memory
    }
    onApply({ tabOrder: order, shopLayout: { ...localShop } });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
            {localTabs.map((tab, index) => {
              const expanded = expandedTab === tab;
              const showShopNested = tab === 'Shop' && expanded;

              return (
                <View key={tab} style={styles.sectionBlock}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.reorderCol}>
                      <Pressable
                        hitSlop={6}
                        onPress={() => moveUp(index)}
                        disabled={index === 0}
                        style={[styles.reorderHit, index === 0 && styles.reorderDisabled]}
                      >
                        <Ionicons
                          name="chevron-up"
                          size={18}
                          color={index === 0 ? colors.border : colors.textMuted}
                        />
                      </Pressable>
                      <Ionicons name="reorder-two-outline" size={22} color={colors.textMuted} />
                      <Pressable
                        hitSlop={6}
                        onPress={() => moveDown(index)}
                        disabled={index === localTabs.length - 1}
                        style={[
                          styles.reorderHit,
                          index === localTabs.length - 1 && styles.reorderDisabled,
                        ]}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color={
                            index === localTabs.length - 1 ? colors.border : colors.textMuted
                          }
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.sectionTitle}>{tab}</Text>

                    <Pressable
                      style={styles.addItemsBtn}
                      onPress={() => toggleExpand(tab)}
                      hitSlop={6}
                    >
                      <Text style={styles.addItemsText}>{rightLabel(tab)}</Text>
                      <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.primary}
                      />
                    </Pressable>

                    <Pressable
                      hitSlop={8}
                      onPress={() => removeTab(tab)}
                      style={styles.trashBtn}
                      accessibilityLabel={`Hide ${tab} tab`}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </Pressable>
                  </View>

                  {showShopNested ? (
                    <View style={styles.nested}>
                      <Text style={styles.nestedHint}>
                        Choose which blocks appear on the Shop tab.
                      </Text>
                      <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Top picks</Text>
                        <Switch
                          value={localShop.topPicks}
                          onValueChange={(v) =>
                            setLocalShop((s) => ({ ...s, topPicks: v }))
                          }
                          trackColor={{ false: colors.border, true: colors.primaryLight }}
                          thumbColor={colors.surface}
                        />
                      </View>
                      <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Newly listed</Text>
                        <Switch
                          value={localShop.newlyListed}
                          onValueChange={(v) =>
                            setLocalShop((s) => ({ ...s, newlyListed: v }))
                          }
                          trackColor={{ false: colors.border, true: colors.primaryLight }}
                          thumbColor={colors.surface}
                        />
                      </View>
                      <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>All items</Text>
                        <Switch
                          value={localShop.allItems}
                          onValueChange={(v) =>
                            setLocalShop((s) => ({ ...s, allItems: v }))
                          }
                          trackColor={{ false: colors.border, true: colors.primaryLight }}
                          thumbColor={colors.surface}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}

            <Pressable style={styles.addSectionRow} onPress={addHiddenTab}>
              <Ionicons name="add" size={22} color={colors.primary} />
              <Text style={styles.addSectionText}>Add Section</Text>
            </Pressable>
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
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  reorderCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  reorderHit: {
    paddingVertical: 2,
  },
  reorderDisabled: {
    opacity: 0.35,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: '38%',
  },
  addItemsText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    flexShrink: 1,
  },
  trashBtn: {
    marginLeft: 2,
  },
  nested: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  nestedHint: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  addSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addSectionText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
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
