/**
 * Meetup time & place — buyer/seller can confirm the proposed details or
 * suggest new ones. Reads the latest `meetups` row for the conversation so
 * the UI mirrors what the inbox/status pipeline derives.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MeetupMapPreview } from '@/components/MeetupMapPreview';
import { RemoteImage } from '@/components/RemoteImage';
import { useAuth } from '@/context/AuthContext';
import { NEARBY_PICKUP_SPOTS } from '@/data/mockPickupLocations';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import { navigateToUserProfile } from '@/navigation/navigateToUserProfile';
import {
  confirmMeetup,
  fetchLatestMeetup,
  proposeMeetup,
  type MeetupRecord,
} from '@/services/meetups';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';
import { regionForMeetupLocation } from '@/utils/meetupLocationCoords';
import type { RootStackParamList } from '@/navigation/types';

const LOCATION_PRESETS = NEARBY_PICKUP_SPOTS.map((spot) => spot.name);

function nextDay(base: Date, daysAhead: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + daysAhead);
  return next;
}

function defaultDateInput() {
  const d = nextDay(new Date(), 1);
  return d.toISOString().slice(0, 10);
}

function defaultTimeInput() {
  return '18:30';
}

function parseCustomDateTime(dateInput: string, timeInput: string): Date | null {
  const date = dateInput.trim();
  const time = timeInput.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  const dt = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatScheduledAt(scheduledAt: string | null): string | null {
  if (!scheduledAt) return null;
  const dt = new Date(scheduledAt);
  if (Number.isNaN(dt.getTime())) return null;
  const now = new Date();
  const sameDay =
    dt.getFullYear() === now.getFullYear() &&
    dt.getMonth() === now.getMonth() &&
    dt.getDate() === now.getDate();
  const tomorrow = nextDay(now, 1);
  const isTomorrow =
    dt.getFullYear() === tomorrow.getFullYear() &&
    dt.getMonth() === tomorrow.getMonth() &&
    dt.getDate() === tomorrow.getDate();
  const time = dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;
  const dayLabel = dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return `${dayLabel} · ${time}`;
}

export function MeetupDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'MeetupDetails'>>();
  const {
    role,
    title,
    price,
    imageUrl,
    location: paramLocation = 'LSU Student Union',
    timeLabel: paramTimeLabel = 'Today · 6:30 PM',
    conversationId,
    peerUserId,
    peerHandle,
    peerName,
    peerAvatarUrl,
  } = params;
  const { user } = useAuth();
  const sessionUserId = user?.id ?? null;
  const viewerProfileId = useViewerProfileId();
  const peerLabel = peerName ?? peerHandle;
  const insets = useSafeAreaInsets();

  const [meetup, setMeetup] = useState<MeetupRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<'confirm' | 'propose' | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState<string>(paramLocation);
  const [draftCustomLocation, setDraftCustomLocation] = useState<string>('');
  const [draftDateInput, setDraftDateInput] = useState<string>(defaultDateInput());
  const [draftTimeInput, setDraftTimeInput] = useState<string>(defaultTimeInput());
  const [draftPin, setDraftPin] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );

  const loadMeetup = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const latest = await fetchLatestMeetup({
        conversationId,
        sessionUserId,
      });
      setMeetup(latest);
    } finally {
      setLoading(false);
    }
  }, [conversationId, sessionUserId]);

  useEffect(() => {
    void loadMeetup();
  }, [loadMeetup]);

  const displayLocation =
    meetup?.locationLabel?.trim() && meetup.locationLabel.trim().length > 0
      ? meetup.locationLabel
      : paramLocation;
  const displayTimeLabel =
    formatScheduledAt(meetup?.scheduledAt ?? null) ?? paramTimeLabel;

  const status: MeetupRecord['status'] | null = meetup?.status ?? null;
  const statusBadge = useMemo(() => {
    if (status === 'confirmed') {
      return { label: 'Confirmed', color: colors.success };
    }
    if (status === 'completed') {
      return { label: 'Completed', color: colors.success };
    }
    if (status === 'cancelled') {
      return { label: 'Cancelled', color: colors.textMuted };
    }
    if (status === 'proposed') {
      return { label: 'Awaiting confirmation', color: colors.primary };
    }
    return null;
  }, [status]);

  const canMutate = Boolean(conversationId);

  const handleConfirm = async () => {
    if (busy || !canMutate) {
      if (!canMutate) {
        Alert.alert(
          'Start a conversation first',
          'Send a message or offer so we can save the meetup for both of you.',
        );
      }
      return;
    }
    setBusy('confirm');
    try {
      const result = await confirmMeetup({
        conversationId: conversationId!,
        fallbackLocationLabel: displayLocation,
        fallbackScheduledAt: meetup?.scheduledAt ?? null,
        fallbackLat: meetup?.lat ?? null,
        fallbackLng: meetup?.lng ?? null,
        sessionUserId,
      });
      if (!result) {
        Alert.alert(
          'Could not confirm meetup',
          'Please check your connection and try again.',
        );
        return;
      }
      setMeetup(result);
    } finally {
      setBusy(null);
    }
  };

  const openSuggestSheet = () => {
    if (!canMutate) {
      Alert.alert(
        'Start a conversation first',
        'Suggesting meetup details writes to the chat thread, so you need a conversation open with the other person.',
      );
      return;
    }
    setDraftLocation(
      meetup?.locationLabel?.trim() && LOCATION_PRESETS.includes(meetup.locationLabel)
        ? meetup.locationLabel
        : LOCATION_PRESETS.includes(paramLocation)
          ? paramLocation
          : LOCATION_PRESETS[0] ?? '',
    );
    setDraftCustomLocation(
      meetup?.locationLabel &&
        !LOCATION_PRESETS.includes(meetup.locationLabel)
        ? meetup.locationLabel
        : '',
    );
    const defaultDt = meetup?.scheduledAt ? new Date(meetup.scheduledAt) : null;
    setDraftDateInput(
      defaultDt && !Number.isNaN(defaultDt.getTime())
        ? defaultDt.toISOString().slice(0, 10)
        : defaultDateInput(),
    );
    setDraftTimeInput(
      defaultDt && !Number.isNaN(defaultDt.getTime())
        ? `${`${defaultDt.getHours()}`.padStart(2, '0')}:${`${defaultDt.getMinutes()}`.padStart(2, '0')}`
        : defaultTimeInput(),
    );
    if (typeof meetup?.lat === 'number' && typeof meetup?.lng === 'number') {
      setDraftPin({ latitude: meetup.lat, longitude: meetup.lng });
    } else {
      setDraftPin(null);
    }
    setSuggestOpen(true);
  };

  const submitSuggestion = async () => {
    if (busy) return;
    const chosenLocation =
      draftCustomLocation.trim().length > 0 ? draftCustomLocation.trim() : draftLocation;
    if (!chosenLocation) {
      Alert.alert('Pick a location', 'Choose one of the spots or enter your own.');
      return;
    }
    const scheduledDate = parseCustomDateTime(draftDateInput, draftTimeInput);
    if (!scheduledDate) {
      Alert.alert(
        'Invalid date/time',
        'Use date format YYYY-MM-DD and time format HH:MM (24-hour).',
      );
      return;
    }
    const scheduledAt = scheduledDate.toISOString();
    setBusy('propose');
    try {
      const result = await proposeMeetup({
        conversationId: conversationId!,
        locationLabel: chosenLocation,
        scheduledAt,
        lat: draftPin?.latitude ?? null,
        lng: draftPin?.longitude ?? null,
        sessionUserId,
      });
      if (!result) {
        Alert.alert(
          'Could not save suggestion',
          'Please check your connection and try again.',
        );
        return;
      }
      setMeetup(result);
      setSuggestOpen(false);
    } finally {
      setBusy(null);
    }
  };

  const isConfirmed = status === 'confirmed' || status === 'completed';
  const draftChosenLocation =
    draftCustomLocation.trim().length > 0 ? draftCustomLocation.trim() : draftLocation;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerIconButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Meetup Details</Text>
        <View style={styles.headerIconButton} />
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
              {statusBadge ? (
                <View
                  style={[
                    styles.statusPill,
                    { borderColor: statusBadge.color, backgroundColor: `${statusBadge.color}14` },
                  ]}
                >
                  <Ionicons
                    name={
                      status === 'confirmed' || status === 'completed'
                        ? 'shield-checkmark'
                        : 'time-outline'
                    }
                    size={12}
                    color={statusBadge.color}
                  />
                  <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
                    {statusBadge.label}
                  </Text>
                </View>
              ) : null}
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
                viewerProfileId,
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
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View style={styles.detailValueWrap}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {displayLocation}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.detailValueWrap}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{displayTimeLabel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.mapSection}>
            <MeetupMapPreview location={displayLocation} />
          </View>
        </View>

        <Pressable
          style={[
            styles.btnWhite,
            (busy === 'confirm' || isConfirmed || !canMutate) && styles.btnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={busy === 'confirm' || isConfirmed || !canMutate}
        >
          <View style={styles.actionContent}>
            <Ionicons
              name={isConfirmed ? 'checkmark-circle' : 'shield-checkmark-outline'}
              size={18}
              color={isConfirmed ? colors.success : colors.textPrimary}
            />
            <Text
              style={[
                styles.btnWhiteText,
                isConfirmed && { color: colors.success },
              ]}
            >
              {isConfirmed
                ? 'Meetup Confirmed'
                : busy === 'confirm'
                  ? 'Confirming…'
                  : 'Confirm Details'}
            </Text>
          </View>
          {!isConfirmed ? (
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          ) : null}
        </Pressable>

        <Pressable
          style={[styles.btnPurple, busy === 'propose' && styles.btnDisabled]}
          onPress={openSuggestSheet}
          disabled={busy === 'propose' || loading}
        >
          <View style={styles.actionContent}>
            <Ionicons name="create-outline" size={18} color={colors.textInverse} />
            <Text style={styles.btnPurpleText}>
              {status ? 'Suggest New Details' : 'Suggest Meetup Details'}
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

      <Modal
        visible={suggestOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSuggestOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSuggestOpen(false)}
          accessibilityLabel="Close suggestion sheet"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboardWrap}
          pointerEvents="box-none"
        >
          <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Suggest meetup details</Text>
            <Text style={styles.sheetSubtitle}>
              Pick where and when you want to meet. Your suggestion is shared in
              the chat thread.
            </Text>

            <Text style={styles.sheetSectionLabel}>Where</Text>
            <View style={styles.chipRow}>
              {LOCATION_PRESETS.map((opt) => {
                const active =
                  draftCustomLocation.trim().length === 0 && draftLocation === opt;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      setDraftLocation(opt);
                      setDraftCustomLocation('');
                    }}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                      numberOfLines={1}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={draftCustomLocation}
              onChangeText={setDraftCustomLocation}
              placeholder="Or type a custom spot (e.g. PFT Atrium)"
              placeholderTextColor={colors.textMuted}
              style={styles.textInput}
              accessibilityLabel="Custom meetup location"
            />

            <Text style={[styles.sheetSectionLabel, { marginTop: spacing.md }]}>When</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                value={draftDateInput}
                onChangeText={setDraftDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, styles.dateInput]}
                accessibilityLabel="Meetup date"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                value={draftTimeInput}
                onChangeText={setDraftTimeInput}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, styles.timeInput]}
                accessibilityLabel="Meetup time"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.sheetHint}>Use 24-hour time, e.g. 18:30.</Text>

            <Text style={[styles.sheetSectionLabel, { marginTop: spacing.md }]}>Pick on map</Text>
            <View style={styles.mapPickerWrap}>
              <MapView
                style={styles.mapPicker}
                initialRegion={regionForMeetupLocation(draftChosenLocation || paramLocation)}
                onPress={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setDraftPin({ latitude, longitude });
                  setDraftLocation(
                    `Pinned spot (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                  );
                  setDraftCustomLocation('');
                }}
              >
                {draftPin ? <Marker coordinate={draftPin} /> : null}
              </MapView>
            </View>
            {draftPin ? (
              <Text style={styles.sheetHint}>
                Pin selected: {draftPin.latitude.toFixed(4)}, {draftPin.longitude.toFixed(4)}
              </Text>
            ) : (
              <Text style={styles.sheetHint}>Tap the map to drop a meetup pin.</Text>
            )}

            <View style={styles.sheetButtonRow}>
              <Pressable
                style={[styles.sheetSecondaryBtn]}
                onPress={() => setSuggestOpen(false)}
                disabled={busy === 'propose'}
              >
                <Text style={styles.sheetSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.sheetPrimaryBtn,
                  busy === 'propose' && styles.btnDisabled,
                ]}
                onPress={submitSuggestion}
                disabled={busy === 'propose'}
              >
                <Text style={styles.sheetPrimaryText}>
                  {busy === 'propose' ? 'Sending…' : 'Send suggestion'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
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
    flex: 1,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailValueWrap: {
    flex: 1,
    minWidth: 0,
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
  btnDisabled: {
    opacity: 0.6,
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
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalKeyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  sheetSectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
  },
  chipActive: {
    backgroundColor: '#ECE8FF',
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.primary,
  },
  textInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sheetButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.lg,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1.4,
  },
  timeInput: {
    flex: 1,
  },
  mapPickerWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    height: 170,
  },
  mapPicker: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
  },
  sheetSecondaryBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheetSecondaryText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  sheetPrimaryBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  sheetPrimaryText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
