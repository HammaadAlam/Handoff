/**
 * Active search — query field, recent searches (remove + submit to results).
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_RECENT_SEARCHES } from '@/data/mockData';
import type { SearchStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/styles/theme';

export function SearchQueryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { params } = useRoute<RouteProp<SearchStackParamList, 'SearchQuery'>>();
  const initial = params?.initialQuery ?? '';

  const [query, setQuery] = useState(initial);
  const [recents, setRecents] = useState<string[]>(() => [...DEFAULT_RECENT_SEARCHES]);

  const submit = (q: string) => {
    const t = q.trim();
    if (!t) return;
    setRecents((prev) => {
      const next = [t, ...prev.filter((x) => x !== t)];
      return next.slice(0, 8);
    });
    navigation.navigate('CategoryResults', { query: t });
  };

  const removeRecent = (term: string) => {
    setRecents((prev) => prev.filter((x) => x !== term));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Item Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={22}
          color={colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => submit(query)}
          autoFocus
        />
      </View>

      <Text style={styles.recentLabel}>Recent</Text>
      <FlatList
        data={recents}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={styles.recentRow}
            onPress={() => {
              setQuery(item);
              submit(item);
            }}
          >
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.recentText}>{item}</Text>
            <Pressable
              onPress={() => removeRecent(item)}
              hitSlop={10}
              style={styles.recentRemove}
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No recent searches yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.header,
    fontSize: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: radii.card,
    paddingHorizontal: 12,
    backgroundColor: colors.chipBg,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
  },
  recentLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  recentRemove: {
    padding: 4,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
