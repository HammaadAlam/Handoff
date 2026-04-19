/**
 * Message seller / offer thread — item context, profile strip, bubbles, composer.
 * `entry`: message vs send-offer changes the demo bubbles shown.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { DEFAULT_PEER_AVATAR_URI } from '@/data/mockData';
import type { RootStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/styles/theme';

export function ConversationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Conversation'>>();
  const { title, price, imageUrl, seller, entry, avatarUrl } = params;
  const peerAvatar = avatarUrl ?? DEFAULT_PEER_AVATAR_URI;

  const [input, setInput] = useState(
    entry === 'offer'
      ? 'Would you be willing to negotiate?'
      : '',
  );

  const offerAmount = '$12.00';
  const listPrice = price.includes('$') ? price : `$${price}`;

  const goMeetup = (role: 'buyer' | 'seller') => {
    navigation.navigate('MeetupDetails', {
      role,
      title,
      price: offerAmount,
      imageUrl,
      location: 'LSU Student Union',
      timeLabel: 'Today - 6:30PM',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.sellerHead}>
            <RemoteImage uri={peerAvatar} style={styles.sellerAvatar} />
            <View>
              <Text style={styles.sellerName}>{seller}</Text>
              <Text style={styles.sellerStatus}>Active Yesterday</Text>
            </View>
          </View>
          <Pressable hitSlop={12}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Pressable
          style={styles.itemBar}
          onPress={() =>
            navigation.navigate('ItemDetail', {
              listingId: params.listingId,
              title,
              price,
              imageUrl,
              seller,
            })
          }
        >
          <RemoteImage uri={imageUrl} style={styles.itemThumb} />
          <Text style={styles.itemTitle}>{title}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <ScrollView
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileCard}>
            <RemoteImage uri={peerAvatar} style={styles.bigAvatar} />
            <Text style={styles.profileName}>{seller} &gt;</Text>
            <View style={styles.stars}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star-half-outline" size={16} color={colors.warning} />
              <Text style={styles.reviewCount}> (17)</Text>
            </View>
            <Text style={styles.stats}>67 followers   26 Listings</Text>
          </View>

          <Text style={styles.dateSep}>Mar 2 2026</Text>

          {entry === 'message' ? (
            <View style={styles.alignEnd}>
              <View style={styles.bubbleOut}>
                <Text style={styles.bubbleOutText}>Hey love your item!</Text>
              </View>
              <Text style={styles.ts}>10:02 p.m.</Text>
            </View>
          ) : (
            <View style={styles.alignEnd}>
              <View style={styles.offerBubble}>
                <Text style={styles.offerTitle}>You made an offer!</Text>
                <View style={styles.offerRow}>
                  <Text style={styles.offerNew}>{offerAmount}</Text>
                  <Text style={styles.offerOld}>{listPrice}</Text>
                </View>
                <Text style={styles.offerExp}>Expires in 23h 50m</Text>
              </View>
              <Text style={styles.ts}>10:02 p.m.</Text>
            </View>
          )}

          {entry === 'offer' && (
            <View style={styles.demoRow}>
              <Pressable style={styles.linkBtn} onPress={() => goMeetup('buyer')}>
                <Text style={styles.linkBtnText}>Meetup details (buyer)</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => goMeetup('seller')}>
                <Text style={styles.linkBtnText}>Meetup details (seller)</Text>
              </Pressable>
            </View>
          )}

          {entry === 'message' && (
            <Pressable style={styles.meetupLink} onPress={() => goMeetup('buyer')}>
              <Text style={styles.meetupLinkText}>Preview meetup location →</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={styles.composer}>
          <Pressable style={styles.plusBtn}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
          />
          <Pressable>
            <Ionicons name="send" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  sellerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerName: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.textPrimary,
  },
  sellerStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.chipBg,
  },
  itemTitle: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
  },
  thread: {
    flex: 1,
  },
  threadContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  profileName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stats: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dateSep: {
    alignSelf: 'center',
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  alignEnd: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  bubbleOut: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.button,
    borderBottomRightRadius: 4,
    maxWidth: 280,
  },
  bubbleOutText: {
    color: '#FFF',
    fontSize: 15,
  },
  offerBubble: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: radii.button,
    minWidth: 220,
    borderBottomRightRadius: 4,
  },
  offerTitle: {
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 6,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 6,
  },
  offerNew: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  offerOld: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  offerExp: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  ts: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  demoRow: {
    gap: 8,
    marginTop: spacing.md,
  },
  linkBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  linkBtnText: {
    color: colors.link,
    fontWeight: '600',
    fontSize: 14,
  },
  meetupLink: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  meetupLinkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.surface,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
