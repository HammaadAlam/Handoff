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
  appendLocalThreadMessage,
  ensureConversationForListing,
  fetchConversationPeer,
  fetchLatestOfferAmount,
  fetchMessages,
  sendMessage,
  upsertLocalInboxConversation,
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

function toChatMessage(m: ThreadMessage): ChatMessage {
  return {
    id: m.id,
    text: m.body,
    sender: m.sender,
    createdAt: new Date(m.createdAt).getTime(),
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
    directMessage,
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    conversationId ?? null,
  );
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!activeConversationId) return;
    let cancelled = false;
    void (async () => {
      const [msgs, peer] = await Promise.all([
        fetchMessages({ conversationId: activeConversationId, sessionUserId }),
        fetchConversationPeer({ conversationId: activeConversationId, sessionUserId }),
      ]);
      const latestOffer = await fetchLatestOfferAmount({
        conversationId: activeConversationId,
        sessionUserId,
      });
      if (cancelled) return;
      setMessages(msgs.map(toChatMessage));
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
  }, [activeConversationId, sessionUserId]);

  const offerAmount = persistedOfferAmount ?? routeOfferAmount ?? '$12.00';
  const safePrice = price ?? '';
  const listPrice = safePrice.includes('$') ? safePrice : `$${safePrice}`;
  const hasListingContext = Boolean(!directMessage && params.listingId && title && imageUrl);
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
      title: title ?? `Chat with ${peerName}`,
      price: offerAmount,
      imageUrl: imageUrl ?? peerAvatar,
      location: 'LSU Student Union',
      timeLabel: 'Today - 6:30PM',
      conversationId: activeConversationId ?? conversationId,
      peerUserId: peerId ?? undefined,
      peerHandle: peerName,
      peerName,
      peerAvatarUrl: peerAvatar,
    });
  };

  const handleSend = useCallback(
    async (text: string) => {
      let resolvedConversationId =
        activeConversationId ??
        conversationId ??
        `local:${params.listingId ?? `dm:${peerId ?? 'peer'}`}:draft`;
      if (
        hasListingContext &&
        (!activeConversationId || activeConversationId.startsWith('local:')) &&
        peerId
      ) {
        const ensured = await ensureConversationForListing({
          listingId: params.listingId!,
          sellerProfileId: peerId,
          sessionUserId,
        });
        if (ensured) {
          resolvedConversationId = ensured;
          setActiveConversationId(ensured);
        }
      }

      const optimisticId = `local-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        text,
        sender: 'me',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, optimistic]);
      await appendLocalThreadMessage({
        conversationId: resolvedConversationId,
        sessionUserId,
        message: {
          id: optimistic.id,
          body: optimistic.text,
          createdAt: new Date(optimistic.createdAt).toISOString(),
          sender: optimistic.sender,
        },
      });
      await upsertLocalInboxConversation({
        sessionUserId,
        conversationId: resolvedConversationId,
        listingId: params.listingId ?? `dm:${peerId ?? 'peer'}`,
        title: title ?? peerName,
        price: price ?? '',
        imageUrl: imageUrl ?? peerAvatar,
        seller: peerName,
        peerUserId: peerId ?? undefined,
        peerAvatarUrl: peerAvatar,
        preview: text,
      });
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });

      if (!resolvedConversationId || resolvedConversationId.startsWith('local:')) return;
      const saved = await sendMessage({
        conversationId: resolvedConversationId,
        body: text,
        sessionUserId,
      });
      if (!saved) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? toChatMessage(saved) : m)),
      );
    },
    [
      activeConversationId,
      conversationId,
      params.listingId,
      hasListingContext,
      peerAvatar,
      peerId,
      peerName,
      price,
      sessionUserId,
      title,
      imageUrl,
    ],
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
            </View>
          </Pressable>
          <Pressable hitSlop={12}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {hasListingContext ? (
          <Pressable
            style={styles.itemBar}
            onPress={() =>
              navigation.navigate('ItemDetail', {
                listingId: params.listingId!,
                title: title!,
                price: price!,
                imageUrl: imageUrl!,
                seller,
                sellerProfileId: peerId ?? undefined,
              })
            }
          >
            <RemoteImage uri={imageUrl!} style={styles.itemThumb} />
            <Text style={styles.itemTitle}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}

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
            <Text style={styles.profileName}>{peerName}</Text>
            <Text style={styles.viewProfileHint}>View profile</Text>
          </Pressable>

          {messages.length > 0 ? (
            <Text style={styles.dateSep}>
              {new Date(messages[0]!.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          ) : null}

          {hasListingContext && (entry === 'offer' || !!persistedOfferAmount) ? (
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
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom }}>
          {hasListingContext ? (
            <View style={styles.meetupPillWrap}>
              <Pressable
                style={styles.meetupPill}
                onPress={() => goMeetup('buyer')}
                accessibilityLabel={
                  entry === 'offer'
                    ? MEETUP_DETAILS_LABEL
                    : 'Preview meetup location'
                }
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.meetupPillText} numberOfLines={1}>
                  {entry === 'offer'
                    ? MEETUP_DETAILS_LABEL
                    : 'Preview meetup location'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          ) : null}
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
  viewProfileHint: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: fonts.semiBold,
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
  meetupPillWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: 'flex-start',
  },
  meetupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.bannerTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
    maxWidth: '90%',
  },
  meetupPillText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});
