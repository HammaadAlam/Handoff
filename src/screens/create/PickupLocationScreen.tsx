/**
 * Choose campus pickup — map placeholder + nearby list (tabs + radio + favorite).
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NEARBY_PICKUP_SPOTS, type PickupSpot } from '@/data/mockPickupLocations';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, spacing, typography } from '@/styles/theme';

type Tab = 'Nearby' | 'Previous' | 'Favorites';

export function PickupLocationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const [tab, setTab] = useState<Tab>('Nearby');
  const [selectedId, setSelectedId] = useState<string>(NEARBY_PICKUP_SPOTS[0].id);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set([NEARBY_PICKUP_SPOTS[0].id]),
  );

  const data: PickupSpot[] =
    tab === 'Nearby'
      ? NEARBY_PICKUP_SPOTS
      : tab === 'Previous'
        ? NEARBY_PICKUP_SPOTS.slice(0, 2)
        : NEARBY_PICKUP_SPOTS.filter((s) => favorites.has(s.id));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    navigation.navigate('ListingSuccess');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.titleRow}>
          <Ionicons name="search-outline" size={18} color={colors.textPrimary} />
          <Text style={styles.headerTitle}>Choose Pickup Location</Text>
        </View>
        <Pressable onPress={confirm} hitSlop={12}>
          <Ionicons name="checkmark" size={28} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={40} color={colors.primaryLight} />
        <Text style={styles.mapHint}>Map — plug MapView + pins for LSU campus</Text>
      </View>

      <View style={styles.tabs}>
        {(['Nearby', 'Previous', 'Favorites'] as Tab[]).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t}
            </Text>
            {tab === t ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No locations in this tab yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotName}>{item.name}</Text>
              <Text style={styles.spotAddr}>{item.address}</Text>
              <Text style={styles.spotDist}>{item.distance}</Text>
            </View>
            <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={8}>
              <Ionicons
                name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={favorites.has(item.id) ? '#EF4444' : colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={() => setSelectedId(item.id)}
              style={styles.radioWrap}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedId === item.id && styles.radioOn,
                ]}
              >
                {selectedId === item.id ? <View style={styles.radioInner} /> : null}
              </View>
            </Pressable>
          </View>
        )}
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.textPrimary,
  },
  mapPlaceholder: {
    height: 180,
    marginHorizontal: spacing.md,
    backgroundColor: colors.chipBg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  mapHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  tabTextOn: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 40,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  spotName: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.textPrimary,
  },
  spotAddr: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  spotDist: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  radioWrap: {
    paddingLeft: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
