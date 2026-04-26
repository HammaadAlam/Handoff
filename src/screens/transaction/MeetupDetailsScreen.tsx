/**
 * Meetup time & place — buyer vs seller actions + map preview.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeetupMapPreview } from '@/components/MeetupMapPreview';
import { RemoteImage } from '@/components/RemoteImage';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import { navigateToUserProfile } from '@/navigation/navigateToUserProfile';
import { fonts, colors, spacing } from '@/styles/theme';
import type { RootStackParamList } from '@/navigation/types';

export function MeetupDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'MeetupDetails'>>();
  const {
    role,
    title,
    price,
    imageUrl,
    location = 'LSU Student Union',
    timeLabel = 'Today - 6:30PM',
    peerUserId,
    peerHandle,
    peerName,
    peerAvatarUrl,
  } = params;
  const viewerProfileId = useViewerProfileId();
  const peerLabel = peerName ?? peerHandle;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerIconButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Meetup Details</Text>
        <Pressable style={styles.headerIconButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemCard}>
          <View style={styles.itemRowTop}>
            <RemoteImage uri={imageUrl} style={styles.thumb} />
            <View style={styles.itemMeta}>
              <View style={styles.salePill}>
                <Text style={styles.salePillText}>For Sale</Text>
              </View>
              <Text style={styles.itemTitle} numberOfLines={3}>
                {title}
              </Text>
              <Text style={styles.itemPrice}>{price}</Text>
            </View>
          </View>
        </View>

        {peerLabel ? (
          <Pressable
            style={styles.peerRow}
            onPress={() => {
              if (!peerUserId) return;
              navigateToUserProfile(
                navigation,
                {
                  userId: peerUserId,
                  handle: peerHandle,
                  displayName: peerLabel,
                  avatarUrl: peerAvatarUrl,
                },
                viewerProfileId
              );
            }}
            accessibilityLabel={`View ${peerLabel}'s profile`}
            disabled={!peerUserId}
          >
            {peerAvatarUrl ? (
              <RemoteImage uri={peerAvatarUrl} style={styles.peerAvatar} />
            ) : (
              <View style={[styles.peerAvatar, styles.peerAvatarFallback]}>
                <Ionicons name="person" size={16} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.peerMeta}>
              <Text style={styles.peerRole}>
                {role === 'buyer' ? 'Seller' : 'Buyer'}
              </Text>
              <Text style={styles.peerName} numberOfLines={1}>
                {peerLabel}
              </Text>
            </View>
            <View style={styles.messageButton}>
              <Ionicons
                name="chatbubble-outline"
                size={19}
                color={colors.primary}
              />
            </View>
          </Pressable>
        ) : null}

        <View style={styles.detailsCard}>
          <Pressable style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{location}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={styles.detailDivider} />

          <Pressable style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{timeLabel}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={styles.mapSection}>
            <MeetupMapPreview location={location} />
          </View>
        </View>

        {role !== 'seller' ? (
          <Pressable style={styles.btnWhite}>
            <View style={styles.actionContent}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.btnWhiteText}>Confirm Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          </Pressable>
        ) : null}

        <Pressable style={styles.btnPurple}>
          <View style={styles.actionContent}>
            <Ionicons name="create-outline" size={18} color={colors.textInverse} />
            <Text style={styles.btnPurpleText}>
              {role === 'seller' ? 'Suggest Meetup Details' : 'Suggest New Details'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textInverse} />
        </Pressable>

        <View style={styles.disclaimer}>
          <View style={styles.disclaimerIconWrap}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          </View>
          <Text style={styles.disclaimerText}>
            For your safety, we recommend completing exchanges in well-lit public locations on
            campus.
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.6,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
  },
  itemRowTop: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 118,
    height: 118,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  itemMeta: {
    flex: 1,
  },
  salePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CFC9F8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  salePillText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  itemTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  itemPrice: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.primary,
    marginTop: 6,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  peerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.chipBg,
  },
  peerAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerMeta: {
    flex: 1,
    minWidth: 0,
  },
  peerRole: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  peerName: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: colors.textPrimary,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  detailRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  detailValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  mapSection: {
    marginTop: spacing.sm,
  },
  btnPurple: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnPurpleText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  btnWhite: {
    marginTop: 12,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#CFC9F8',
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnWhiteText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disclaimer: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#F5F4FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  disclaimerIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
