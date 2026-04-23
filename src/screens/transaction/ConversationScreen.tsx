/**
 * Message seller / offer thread — item context, profile strip, bubbles, composer.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { RemoteImage } from '@/components/RemoteImage';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PEER_AVATAR_URI } from '@/data/mockData';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import { navigateToUserProfile } from '@/navigation/navigateToUserProfile';
import type { RootStackParamList } from '@/navigation/types';
import {
  fetchConversationPeer,
  fetchLatestOfferAmount,
  fetchMessages,
  sendMessage,
  type ThreadMessage,
} from '@/services/conversations';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

type ChatMessage = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  createdAt: number;
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const MEETUP_DETAILS_LABEL = 'Meetup details';
const DEFAULT_THREAD_OPENER = 'Hi! Is this still available?';

function toChatMessage(m: ThreadMessage): ChatMessage {
  return {
    id: m.id,
    text: m.body,
    sender: m.sender,
    createdAt: new Date(m.createdAt).getTime(),
  };
}

function buildDefaultMessage(): ChatMessage {
  return {
    id: 'm-default',
    text: DEFAULT_THREAD_OPENER,
    sender: 'me',
    createdAt: Date.now() - 1000 * 60,
  };
}

export function ConversationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Conversation'>>();
  const {
    title,
    price,
    imageUrl,
    seller,
    peerUserId,
    peerDisplayName,
    entry,
    avatarUrl,
    offerAmount: routeOfferAmount,
    conversationId,
  } = params;
  const { user } = useAuth();
  const viewerProfileId = useViewerProfileId();
  const sessionUserId = user?.id ?? null;
  const [peerAvatar, setPeerAvatar] = useState<string>(
    avatarUrl ?? DEFAULT_PEER_AVATAR_URI,
  );
  const [peerName, setPeerName] = useState<string>(peerDisplayName ?? seller);
  const [peerId, setPeerId] = useState<string | null>(peerUserId ?? null);
  const [persistedOfferAmount, setPersistedOfferAmount] = useState<string | null>(
    routeOfferAmount ?? null,
  );
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    conversationId || entry !== 'message'
      ? []
      : [
          buildDefaultMessage(),
        ],
  );
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    void (async () => {
      const [msgs, peer] = await Promise.all([
        fetchMessages({ conversationId, sessionUserId }),
        fetchConversationPeer({ conversationId, sessionUserId }),
      ]);
      const latestOffer = await fetchLatestOfferAmount({
        conversationId,
        sessionUserId,
      });
      if (cancelled) return;
      setMessages(
        msgs.length > 0
          ? msgs.map(toChatMessage)
          : entry === 'message'
            ? [buildDefaultMessage()]
            : [],
      );
      if (latestOffer) setPersistedOfferAmount(latestOffer);
      if (peer) {
        setPeerId(peer.id);
        setPeerName(peer.handle);
        setPeerAvatar(peer.avatarUrl);
      }
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, entry, sessionUserId]);

  const offerAmount = persistedOfferAmount ?? routeOfferAmount ?? '$12.00';
  const listPrice = price.includes('$') ? price : `$${price}`;
  const initialDraft =
    entry === 'offer' ? 'Would you be willing to negotiate?' : '';

  const openPeerProfile = useCallback(() => {
    if (!peerId) return;
    navigateToUserProfile(
      navigation,
      {
        userId: peerId,
        displayName: peerName,
        avatarUrl: peerAvatar,
        handle: peerName,
      },
      viewerProfileId
    );
  }, [navigation, peerAvatar, peerId, peerName, viewerProfileId]);

  const goMeetup = (role: 'buyer' | 'seller') => {
    navigation.navigate('MeetupDetails', {
      role,
      title,
      price: offerAmount,
      imageUrl,
      location: 'LSU Student Union',
      timeLabel: 'Today - 6:30PM',
      peerUserId: peerId ?? undefined,
      peerHandle: peerName,
      peerName,
      peerAvatarUrl: peerAvatar,
    });
  };

  const handleSend = useCallback(
    async (text: string) => {
      const optimisticId = `local-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        text,
        sender: 'me',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, optimistic]);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });

      if (!conversationId || conversationId.startsWith('local:')) return;
      const saved = await sendMessage({
        conversationId,
        body: text,
        sessionUserId,
      });
      if (!saved) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? toChatMessage(saved) : m)),
      );
    },
    [conversationId, sessionUserId],
  );

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
          <Pressable
            style={styles.sellerHead}
            onPress={openPeerProfile}
            accessibilityLabel={`View ${peerName}'s profile`}
            disabled={!peerId}
          >
            <RemoteImage uri={peerAvatar} style={styles.sellerAvatar} />
            <View>
              <Text style={styles.sellerName}>{peerName}</Text>
              <Text style={styles.sellerStatus}>Active Yesterday</Text>
            </View>
          </Pressable>
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
              sellerProfileId: peerId ?? undefined,
            })
          }
        >
          <RemoteImage uri={imageUrl} style={styles.itemThumb} />
          <Text style={styles.itemTitle}>{title}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <ScrollView
          ref={scrollRef}
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
        >
          <Pressable
            style={styles.profileCard}
            onPress={openPeerProfile}
            accessibilityLabel={`View ${peerName}'s profile`}
            disabled={!peerId}
          >
            <RemoteImage uri={peerAvatar} style={styles.bigAvatar} />
            <Text style={styles.profileName}>{peerName} &gt;</Text>
            <View style={styles.stars}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star" size={16} color={colors.warning} />
              <Ionicons name="star-half-outline" size={16} color={colors.warning} />
              <Text style={styles.reviewCount}> (17)</Text>
            </View>
            <Text style={styles.stats}>67 followers   26 Listings</Text>
          </Pressable>

          <Text style={styles.dateSep}>
            {new Date().toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {entry === 'offer' || !!persistedOfferAmount ? (
            <View style={styles.alignEnd}>
              <View style={styles.offerBubble}>
                <Text style={styles.offerTitle}>You made an offer!</Text>
                <View style={styles.offerRow}>
                  <Text style={styles.offerNew}>{offerAmount}</Text>
                  <Text style={styles.offerOld}>{listPrice}</Text>
                </View>
                <Text style={styles.offerExp}>Expires in 23h 50m</Text>
              </View>
              <Text style={styles.ts}>{formatTime(Date.now())}</Text>
            </View>
          ) : null}

          {messages.map((m) => (
            <View
              key={m.id}
              style={m.sender === 'me' ? styles.alignEnd : styles.alignStart}
            >
              <View
                style={m.sender === 'me' ? styles.bubbleOut : styles.bubbleIn}
              >
                <Text
                  style={
                    m.sender === 'me' ? styles.bubbleOutText : styles.bubbleInText
                  }
                >
                  {m.text}
                </Text>
              </View>
              <Text style={styles.ts}>{formatTime(m.createdAt)}</Text>
            </View>
          ))}

          <Pressable
            style={styles.meetupCta}
            onPress={() => goMeetup('buyer')}
            accessibilityLabel={
              entry === 'offer'
                ? MEETUP_DETAILS_LABEL
                : 'Preview meetup location'
            }
          >
            <Text style={styles.meetupCtaText}>
              {entry === 'offer'
                ? MEETUP_DETAILS_LABEL
                : 'Preview meetup location →'}
            </Text>
          </Pressable>
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom }}>
          <ChatComposer
            initialValue={initialDraft}
            placeholder={
              entry === 'offer'
                ? 'Add a note to your offer…'
                : 'Type a message'
            }
            onSend={handleSend}
          />
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.bold,
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
  alignStart: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
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
    color: colors.textInverse,
    fontSize: 15,
  },
  bubbleIn: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.button,
    borderBottomLeftRadius: 4,
    maxWidth: 280,
  },
  bubbleInText: {
    color: colors.textPrimary,
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
    color: colors.textInverse,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 6,
  },
  offerNew: {
    color: colors.textInverse,
    fontSize: 20,
    fontFamily: fonts.extraBold,
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
  /** Same width/height for offer vs message threads */
  meetupCta: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button,
    backgroundColor: colors.bannerTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
  },
  meetupCtaText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textAlign: 'center',
  },
});
