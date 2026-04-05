/**
 * Profile — stats, bio, featured carousels, item grid (matches profile mockup).
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ManageSectionsModal } from '@/components/profile/ManageSectionsModal';
import { RemoteImage } from '@/components/RemoteImage';
import {
  DEFAULT_PEER_AVATAR_URI,
  PLACEHOLDER_IMAGE_URI,
  PROFILE_BEST_SELLERS,
  PROFILE_FEATURED_LISTINGS,
  PROFILE_MY_ITEMS,
  type ListingItem,
} from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { ProfileTabNavigation } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/styles/theme';

export function ProfileScreen() {
  const navigation = useNavigation<ProfileTabNavigation>();
  const [manageSectionsOpen, setManageSectionsOpen] = useState(false);
  /** Demo: tap placeholder to “add” photo */
  const [profilePhotoReady, setProfilePhotoReady] = useState(false);

  const openListing = (item: ListingItem) => {
    navigateToItemDetail(navigation, {
      listingId: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      seller: 'fahdhkhattak',
      sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
    });
  };

  const shareProfile = async () => {
    try {
      await Share.share({
        message:
          'Check out fahdhkhattak on Handoff — campus marketplace.\nhttps://handoff.app/u/fahdhkhattak',
      });
    } catch {
      Alert.alert('Share', 'Could not open the share sheet.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ManageSectionsModal
        visible={manageSectionsOpen}
        onClose={() => setManageSectionsOpen(false)}
      />
      <View style={styles.topRow}>
        <View style={styles.spacer} />
        <Text style={styles.username}>fahdhkhattak</Text>
        <Pressable hitSlop={12} onPress={() => setManageSectionsOpen(true)}>
          <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.profileRow}>
          <Pressable
            onPress={() => {
              if (!profilePhotoReady) {
                setProfilePhotoReady(true);
              } else {
                Alert.alert('Profile photo', 'Replace photo (demo).');
              }
            }}
            style={styles.avatarPress}
          >
            {profilePhotoReady ? (
              <RemoteImage uri={DEFAULT_PEER_AVATAR_URI} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <RemoteImage
                  uri={PLACEHOLDER_IMAGE_URI}
                  style={styles.avatarPhImage}
                  contentFit="cover"
                />
                <View style={styles.avatarPhOverlay}>
                  <Ionicons name="camera" size={22} color={colors.primary} />
                  <Text style={styles.avatarPhText}>Add photo</Text>
                </View>
              </View>
            )}
          </Pressable>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>67</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>192</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.stat}>
              <View style={styles.ratingRow}>
                <Text style={styles.statNum}>4.2</Text>
                <Ionicons name="star" size={14} color={colors.warning} />
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.bioRow}
          onPress={() => setManageSectionsOpen(true)}
        >
          <Text style={styles.bio}>Sellin Clothes for a livin&apos;</Text>
          <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.sold}>Items Sold : 18</Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.btnOutline}
            onPress={() => setManageSectionsOpen(true)}
          >
            <Text style={styles.btnOutlineText}>Edit Items</Text>
          </Pressable>
          <Pressable style={styles.btnPrimary} onPress={shareProfile}>
            <Text style={styles.btnPrimaryText}>Share Profile</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Featured Items</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROFILE_FEATURED_LISTINGS.map((item) => (
            <Pressable key={item.id} onPress={() => openListing(item)}>
              <RemoteImage uri={item.imageUrl} style={styles.thumb} />
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.section}>Best Sellers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROFILE_BEST_SELLERS.map((item) => (
            <Pressable key={item.id} onPress={() => openListing(item)}>
              <RemoteImage uri={item.imageUrl} style={styles.thumb} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.myItemsHeader}>
          <Text style={styles.section}>My Items</Text>
          <Pressable onPress={() => setManageSectionsOpen(true)}>
            <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.grid2}>
          {PROFILE_MY_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={styles.gridCell}
              onPress={() => openListing(item)}
            >
              <RemoteImage uri={item.imageUrl} style={styles.gridImg} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  spacer: { width: 28 },
  username: {
    flex: 1,
    textAlign: 'center',
    ...typography.header,
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarPress: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    backgroundColor: colors.bannerTint,
  },
  avatarPhImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  avatarPhOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  avatarPhText: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: 4,
    color: colors.primaryDark,
    fontSize: 11,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bio: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sold: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontWeight: '700',
    color: '#FFF',
  },
  section: {
    ...typography.header,
    fontSize: 16,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: colors.border,
  },
  myItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  grid2: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  gridCell: {
    flex: 1,
  },
  gridImg: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
});
