/**
 * Inbox — filters, search, conversation rows (matches messaging mockup).
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { InboxTabNavigation } from '@/navigation/types';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MOCK_CONVERSATIONS,
  type ConversationRow,
  type InboxFilter,
} from '@/data/mockData';
import { RemoteImage } from '@/components/RemoteImage';
import { navigateToConversation } from '@/navigation/navigateConversation';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

const FILTERS: InboxFilter[] = ['All', 'Selling', 'Buying', 'Archived'];

function statusStyle(status: ConversationRow['status']) {
  switch (status) {
    case 'Meetup Confirmed':
      return { bg: colors.primaryLight, text: colors.textPrimary };
    case 'Pending':
      return { bg: '#FEF9C3', text: colors.textPrimary };
    case 'Completed':
      return { bg: '#DCFCE7', text: colors.textPrimary };
    default:
      return { bg: colors.chipBg, text: colors.textPrimary };
  }
}

function matchesFilter(row: ConversationRow, filter: InboxFilter): boolean {
  if (filter === 'Archived') return !!row.archived;
  if (row.archived) return false;
  if (filter === 'All') return true;
  if (filter === 'Selling') return row.role === 'selling';
  if (filter === 'Buying') return row.role === 'buying';
  return true;
}

export function InboxScreen() {
  const navigation = useNavigation<InboxTabNavigation>();
  const [filter, setFilter] = useState<InboxFilter>('All');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<ConversationRow[]>(MOCK_CONVERSATIONS);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesFilter(row, filter)) return false;
      if (!q) return true;
      const hay = `${row.userItem} ${row.preview} ${row.title}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, filter, query]);

  const openConversation = (item: ConversationRow) => {
    navigateToConversation(navigation, {
      listingId: item.listingId,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      seller: item.seller,
      avatarUrl: item.peerAvatarUrl,
      entry: 'message',
    });
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const renderRightActions = (item: ConversationRow) => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => removeRow(item.id)}
    >
      <Ionicons name="trash" size={24} color="#FFF" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>Inbox</Text>
        <Pressable
          hitSlop={12}
          style={styles.bell}
          onPress={() => setNotificationsOn((v) => !v)}
          accessibilityLabel={
            notificationsOn ? 'Turn notifications off' : 'Turn notifications on'
          }
        >
          <Ionicons
            name={notificationsOn ? 'notifications' : 'notifications-off-outline'}
            size={24}
            color={notificationsOn ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.filtersScrollContent}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipOn]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextOn,
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search Conversations"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations match.</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => {
          const st = statusStyle(item.status);
          const rowContent = (
            <RectButton
              style={styles.row}
              onPress={() => openConversation(item)}
            >
              <RemoteImage uri={item.peerAvatarUrl} style={styles.avatarImg} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.userItem}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.preview}
                </Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.badgeText, { color: st.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </RectButton>
          );

          return (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              {rowContent}
            </Swipeable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  headerSpacer: {
    width: 28,
  },
  title: {
    ...typography.header,
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  bell: {
    width: 28,
    alignItems: 'flex-end',
  },
  filtersWrap: {
    marginBottom: spacing.md,
  },
  filtersScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  filterChip: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.chipBg,
  },
  filterChipOn: {
    backgroundColor: colors.bannerTint,
  },
  filterText: {
    ...typography.caption,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  filterTextOn: {
    color: colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
    ...typography.body,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: colors.background,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.border,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  preview: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  meta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    marginVertical: 4,
    borderRadius: 12,
  },
});
