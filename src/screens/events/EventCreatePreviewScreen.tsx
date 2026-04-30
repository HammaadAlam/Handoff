/**
 * Event Create Preview screen — events UI.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { useAuth } from '@/context/AuthContext';
import { mergeCreateEventDraft } from '@/data/createEventDraft';
import type { RootStackParamList } from '@/navigation/types';
import { createEvent } from '@/services/events';
import { resolveViewerProfileId } from '@/services/viewer';
import { colors, fonts, spacing } from '@/styles/theme';

const TOTAL_STEPS = 2;

function StepProgress({ active }: { active: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const step = i + 1;
        return (
          <View
            key={step}
            style={[styles.progressTrack, step <= active && styles.progressTrackActive]}
          />
        );
      })}
    </View>
  );
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function EventCreatePreviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'EventCreatePreview'>>();
  const draft = mergeCreateEventDraft(params?.draft);
  const { user, authBypass } = useAuth();
  const [publishing, setPublishing] = useState(false);

  const handlePostEvent = async () => {
    if (publishing) return;
    if (!user) {
      Alert.alert(
        authBypass ? 'Account required' : 'Sign in required',
        authBypass
          ? 'You are currently in test bypass mode. Sign in with an account to post events.'
          : 'You need to be signed in to publish an event.',
      );
      return;
    }

    setPublishing(true);
    try {
      const ownerId = await resolveViewerProfileId(user.id);
      if (!ownerId) {
        Alert.alert('Profile not ready', 'We could not resolve your profile. Please try again.');
        return;
      }

      const result = await createEvent({
        ownerId,
        title: draft.title,
        description: draft.description,
        locationLabel: draft.locationLabel,
        locationLat: draft.locationLat ?? null,
        locationLng: draft.locationLng ?? null,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt || undefined,
        imageUrl: draft.imageUri || undefined,
      });

      if (!result.ok) {
        Alert.alert('Could not create event', result.reason);
        return;
      }

      navigation.replace('EventCreateSuccess', { eventId: result.event.id });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Preview Event</Text>
          <Text style={styles.stepText}>Step 2 of 2</Text>
        </View>
        <View style={styles.headerSide} />
      </View>
      <StepProgress active={2} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {draft.imageUri ? (
          <RemoteImage uri={draft.imageUri} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Ionicons name="calendar-outline" size={34} color={colors.primary} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>{draft.title || 'Untitled event'}</Text>
          <Text style={styles.meta}>Starts {formatEventDate(draft.startsAt)}</Text>
          <Text style={styles.meta}>Ends {formatEventDate(draft.endsAt)}</Text>
          <Text style={styles.meta}>Location: {draft.locationLabel || 'Campus venue'}</Text>
          {typeof draft.locationLat === 'number' && typeof draft.locationLng === 'number' ? (
            <Text style={styles.meta}>
              Coordinates: {draft.locationLat.toFixed(4)}, {draft.locationLng.toFixed(4)}
            </Text>
          ) : null}
          <Text style={styles.description}>
            {draft.description || 'No event description provided.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.secondary} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>
        <Pressable
          disabled={publishing}
          onPress={handlePostEvent}
          style={[styles.primary, publishing && styles.primaryDisabled]}
        >
          <Text style={styles.primaryText}>{publishing ? 'Posting…' : 'Post Event'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 19 },
  stepText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 12, marginTop: 4 },
  headerSide: { width: 24 },
  progressRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 54,
    marginTop: 18,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressTrackActive: {
    backgroundColor: colors.primary,
  },
  content: { padding: spacing.md, paddingBottom: 130 },
  hero: { width: '100%', height: 210, borderRadius: 14, backgroundColor: colors.chipBg },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  card: {
    marginTop: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  title: { color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 22 },
  meta: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 13, marginTop: 8 },
  description: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondary: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 15 },
  primary: {
    flex: 1,
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryDisabled: { opacity: 0.65 },
  primaryText: { color: colors.textInverse, fontFamily: fonts.bold, fontSize: 15 },
});
