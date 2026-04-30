/**
 * Event Create Details screen — events UI.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mergeCreateEventDraft } from '@/data/createEventDraft';
import { NEARBY_PICKUP_SPOTS } from '@/data/mockPickupLocations';
import type { RootStackParamList } from '@/navigation/types';
import { colors, fonts, radii, spacing } from '@/styles/theme';
import { regionForMeetupLocation } from '@/utils/meetupLocationCoords';
import { RemoteImage } from '@/components/RemoteImage';

const TOTAL_STEPS = 2;
const LOCATION_PRESETS = NEARBY_PICKUP_SPOTS.map((spot) => spot.name);

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

function toLocalDateInput(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

function toLocalTimeInput(iso: string) {
  const date = new Date(iso);
  return `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}

function combineDateTime(dateInput: string, timeInput: string) {
  const parsed = new Date(`${dateInput}T${timeInput}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function EventCreateDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'EventCreateDetails'>>();
  const draft = mergeCreateEventDraft(params?.draft);

  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [locationLabel, setLocationLabel] = useState(draft.locationLabel);
  const [locationPin, setLocationPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    typeof draft.locationLat === 'number' && typeof draft.locationLng === 'number'
      ? { latitude: draft.locationLat, longitude: draft.locationLng }
      : null,
  );
  const [imageUri, setImageUri] = useState(draft.imageUri);
  const [startDate, setStartDate] = useState(toLocalDateInput(draft.startsAt));
  const [startTime, setStartTime] = useState(toLocalTimeInput(draft.startsAt));
  const [endDate, setEndDate] = useState(toLocalDateInput(draft.endsAt));
  const [endTime, setEndTime] = useState(toLocalTimeInput(draft.endsAt));

  const canContinue = useMemo(() => {
    const startsAt = combineDateTime(startDate, startTime);
    const endsAt = combineDateTime(endDate, endTime);
    return (
      title.trim().length > 0 &&
      locationLabel.trim().length > 0 &&
      startsAt != null &&
      endsAt != null &&
      new Date(endsAt).getTime() > new Date(startsAt).getTime()
    );
  }, [title, locationLabel, startDate, startTime, endDate, endTime]);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo library', 'Allow photo library access to choose an event cover.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const continueFlow = () => {
    const startsAt = combineDateTime(startDate, startTime);
    const endsAt = combineDateTime(endDate, endTime);
    if (!startsAt || !endsAt) {
      Alert.alert('Invalid time', 'Please enter a valid start and end date/time.');
      return;
    }
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      Alert.alert('Invalid range', 'End time must be later than start time.');
      return;
    }
    navigation.navigate('EventCreatePreview', {
      draft: {
        title,
        description,
        locationLabel,
        locationLat: locationPin?.latitude ?? null,
        locationLng: locationPin?.longitude ?? null,
        imageUri,
        startsAt,
        endsAt,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Event</Text>
          <Text style={styles.stepText}>Step 1 of 2</Text>
        </View>
        <View style={styles.headerSide} />
      </View>
      <StepProgress active={1} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Campus Movie Night"
          placeholderTextColor={colors.textMuted}
          maxLength={80}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add details students should know before joining."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          maxLength={400}
          style={[styles.input, styles.textArea]}
        />

        <Text style={styles.label}>Location *</Text>
        <View style={styles.locationChipRow}>
          {LOCATION_PRESETS.map((spot) => {
            const active = locationLabel.trim() === spot;
            return (
              <Pressable
                key={spot}
                style={[styles.locationChip, active && styles.locationChipActive]}
                onPress={() => setLocationLabel(spot)}
              >
                <Text
                  style={[styles.locationChipText, active && styles.locationChipTextActive]}
                  numberOfLines={1}
                >
                  {spot}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={locationLabel}
          onChangeText={setLocationLabel}
          placeholder="Or type custom location"
          placeholderTextColor={colors.textMuted}
          maxLength={100}
          style={styles.input}
        />
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={regionForMeetupLocation(locationLabel || 'LSU Campus')}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              setLocationPin({ latitude, longitude });
              setLocationLabel(
                `Pinned location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              );
            }}
          >
            {locationPin ? <Marker coordinate={locationPin} /> : null}
          </MapView>
        </View>
        <Text style={styles.mapHint}>
          Tap map to choose an exact meetup point.
        </Text>

        <Text style={styles.label}>Start (YYYY-MM-DD / HH:MM)</Text>
        <View style={styles.row}>
          <TextInput value={startDate} onChangeText={setStartDate} style={[styles.input, styles.half]} />
          <TextInput value={startTime} onChangeText={setStartTime} style={[styles.input, styles.half]} />
        </View>

        <Text style={styles.label}>End (YYYY-MM-DD / HH:MM)</Text>
        <View style={styles.row}>
          <TextInput value={endDate} onChangeText={setEndDate} style={[styles.input, styles.half]} />
          <TextInput value={endTime} onChangeText={setEndTime} style={[styles.input, styles.half]} />
        </View>

        <Text style={styles.label}>Event cover (optional)</Text>
        <Pressable style={styles.imagePicker} onPress={chooseImage}>
          {imageUri ? (
            <RemoteImage uri={imageUri} style={styles.coverImage} />
          ) : (
            <>
              <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.imagePickerText}>Choose cover image</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          disabled={!canContinue}
          onPress={continueFlow}
          style={[styles.button, !canContinue && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Preview Event</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 8,
  },
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
  content: { paddingHorizontal: spacing.md, paddingTop: 20, paddingBottom: 140 },
  label: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    paddingHorizontal: 14,
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  locationChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chipBg,
    maxWidth: '100%',
  },
  locationChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#ECE8FF',
  },
  locationChipText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  locationChipTextActive: {
    color: colors.primary,
  },
  mapWrap: {
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHint: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 6,
  },
  imagePicker: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  imagePickerText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 6,
  },
  coverImage: { width: '100%', height: 120 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  button: {
    minHeight: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.textInverse, fontFamily: fonts.bold, fontSize: 15 },
});
