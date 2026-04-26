/**
 * Meet Up step: choose fulfillment method and campus pickup spot.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  type MeetupMethod,
  mergeCreateListingDraft,
} from '@/data/createListingDraft';
import { NEARBY_PICKUP_SPOTS } from '@/data/mockPickupLocations';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

type LocationTab = 'Nearby' | 'Previous' | 'Favorites';

type PickerLocation = {
  address: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  distance: string;
  id: string;
  name: string;
};

const LSU_PICKUP_REGION: Region = {
  latitude: 30.4122,
  longitude: -91.1789,
  latitudeDelta: 0.026,
  longitudeDelta: 0.026,
};

const PICKER_LOCATIONS: PickerLocation[] = [
  {
    id: 'student-union',
    name: 'LSU Student Union',
    address: 'LSU Student Union, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4123, longitude: -91.1789 },
    distance: '0.3 mi',
  },
  {
    id: 'police-safety',
    name: 'LSU Police / Public Safety Building',
    address: '204 South Stadium Road, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4099, longitude: -91.1816 },
    distance: '0.4 mi',
  },
  {
    id: 'barnes-noble',
    name: 'LSU Barnes & Noble Bookstore',
    address: '2 Union Square, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4113, longitude: -91.1765 },
    distance: '0.5 mi',
  },
  {
    id: 'library-quad',
    name: 'LSU Library / Quad area',
    address: 'Field House Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4133, longitude: -91.1777 },
    distance: '0.6 mi',
  },
  {
    id: 'memorial-tower',
    name: 'Memorial Tower',
    address: 'Tower Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4142, longitude: -91.1806 },
    distance: '0.6 mi',
  },
  {
    id: 'lsu-urec',
    name: 'LSU UREC',
    address: '102 Student Recreation Complex, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4082, longitude: -91.1769 },
    distance: '0.4 mi',
  },
  {
    id: 'commons-459',
    name: 'The 459 Commons',
    address: 'LSU Campus, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4148, longitude: -91.1744 },
    distance: '0.5 mi',
  },
  {
    id: 'patrick-taylor',
    name: 'Patrick F. Taylor Hall',
    address: 'S Stadium Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4104, longitude: -91.1734 },
    distance: '0.7 mi',
  },
  {
    id: 'business-education',
    name: 'Business Education Complex',
    address: 'Nicholson Dr Extension, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4107, longitude: -91.1858 },
    distance: '0.8 mi',
  },
  {
    id: 'law-center',
    name: 'LSU Law Center',
    address: '1 E Campus Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.414, longitude: -91.1752 },
    distance: '0.6 mi',
  },
  {
    id: 'student-health',
    name: 'Student Health Center',
    address: 'Infirmary Rd, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4118, longitude: -91.1702 },
    distance: '0.9 mi',
  },
  {
    id: 'tiger-stadium-gate',
    name: 'Tiger Stadium Gate Area',
    address: 'N Stadium Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4119, longitude: -91.1838 },
    distance: '0.8 mi',
  },
  {
    id: 'mike-habitat',
    name: 'Mike the Tiger Habitat',
    address: 'N Stadium Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4125, longitude: -91.1834 },
    distance: '0.9 mi',
  },
  {
    id: 'parade-ground',
    name: 'Parade Ground',
    address: 'Dalrymple Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4137, longitude: -91.1782 },
    distance: '0.8 mi',
  },
  {
    id: 'nicholson-gateway',
    name: 'Nicholson Gateway',
    address: 'Nicholson Dr, Baton Rouge, LA 70803',
    coordinate: { latitude: 30.4088, longitude: -91.1851 },
    distance: '1.1 mi',
  },
];

const TOTAL_STEPS = 4;

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

export function PickupLocationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } =
    useRoute<RouteProp<CreateListingStackParamList, 'PickupLocation'>>();
  const draft = mergeCreateListingDraft(params?.draft);
  const [method, setMethod] = useState<MeetupMethod>(
    draft.meetupMethod === 'ship' ? 'meet' : draft.meetupMethod,
  );
  const [location, setLocation] = useState(draft.meetupLocation);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const selectedPickerLocation = PICKER_LOCATIONS.find(
    (candidate) =>
      candidate.name === location ||
      candidate.name.replace('LSU ', '') === location,
  );

  const canContinue = method === 'meet' && location.trim().length > 0;

  const continueFlow = () => {
    if (!canContinue) return;
    navigation.navigate('ListingPreview', {
      draft: {
        ...draft,
        meetupLocation: location,
        meetupMethod: method,
      },
    });
  };

  if (showLocationPicker) {
    return (
      <ChoosePickupLocationPage
        onBack={() => setShowLocationPicker(false)}
        onConfirm={(selectedLocation) => {
          setLocation(selectedLocation.name.replace('LSU ', ''));
          setShowLocationPicker(false);
        }}
        selectedName={location}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Meet Up</Text>
          <Text style={styles.stepText}>Step 4 of {TOTAL_STEPS}</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <StepProgress active={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Meetup method</Text>
        <MethodCard
          active={method === 'meet'}
          icon="location-outline"
          onPress={() => setMethod('meet')}
          subtitle="Meet on campus"
          title="Meet in person"
        />
        <MethodCard
          active={false}
          disabled
          icon="cube-outline"
          onPress={() => {}}
          subtitle="Coming soon"
          title="Shipping"
        />

        <Text style={[styles.sectionLabel, styles.locationsLabel]}>
          Suggested locations
        </Text>
        {NEARBY_PICKUP_SPOTS.map((spot) => {
          const spotLabel = spot.name.replace('LSU ', '');
          const selected = location === spotLabel;
          return (
            <Pressable
              key={spot.id}
              onPress={() => setLocation(spotLabel)}
              style={[styles.locationCard, selected && styles.activeCard]}
            >
              <View style={styles.radioColumn}>
                <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </View>
              <View style={styles.locationCopy}>
                <Text style={styles.locationTitle}>{spotLabel}</Text>
                <Text style={styles.locationDistance}>
                  {spot.distance.replace('0.', '')} walk
                </Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={selected ? colors.primary : colors.border}
              />
            </Pressable>
          );
        })}

        <Pressable
          style={styles.otherLocation}
          onPress={() => setShowLocationPicker(true)}
        >
          <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
          <View style={styles.otherCopy}>
            <Text style={styles.otherText}>
              {selectedPickerLocation?.name ?? 'Choose another location'}
            </Text>
            {selectedPickerLocation ? (
              <Text style={styles.otherMeta}>
                {selectedPickerLocation.address} - {selectedPickerLocation.distance}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
          onPress={continueFlow}
          disabled={!canContinue}
        >
          <Text style={styles.primaryButtonText}>Next: Preview</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ChoosePickupLocationPage({
  onBack,
  onConfirm,
  selectedName,
}: {
  onBack: () => void;
  onConfirm: (location: PickerLocation) => void;
  selectedName: string;
}) {
  const initialSelection =
    PICKER_LOCATIONS.find(
      (candidate) =>
        candidate.name === selectedName ||
        candidate.name.replace('LSU ', '') === selectedName,
    ) ?? null;
  const mapRef = useRef<MapView | null>(null);
  const [tab, setTab] = useState<LocationTab>('Nearby');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelection?.id ?? null,
  );
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return null;
    return PICKER_LOCATIONS.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(trimmed) ||
        candidate.address.toLowerCase().includes(trimmed),
    );
  }, [query]);

  const locations: PickerLocation[] = searchResults
    ? searchResults
    : tab === 'Nearby'
      ? PICKER_LOCATIONS.slice(0, 6)
      : tab === 'Previous'
        ? PICKER_LOCATIONS.slice(6)
        : PICKER_LOCATIONS.filter((candidate) => favorites.has(candidate.id));

  const selectedLocation =
    (selectedId
      ? PICKER_LOCATIONS.find((candidate) => candidate.id === selectedId)
      : null) ?? null;

  useEffect(() => {
    if (!selectedLocation) return;
    mapRef.current?.animateToRegion(
      {
        ...selectedLocation.coordinate,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      280,
    );
  }, [selectedLocation]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.pickerSafe} edges={['top']}>
      <View style={styles.pickerHeader}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.pickerTitle}>Choose Pickup Location</Text>
        <Pressable
          onPress={() => selectedLocation && onConfirm(selectedLocation)}
          hitSlop={12}
          disabled={!selectedLocation}
          style={!selectedLocation && styles.pickerConfirmDisabled}
        >
          <Ionicons name="checkmark" size={25} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.pickerSearchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search address or place near campus"
          placeholderTextColor={colors.textMuted}
          style={styles.pickerSearchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.mapCanvas}>
        <MapView
          ref={mapRef}
          initialRegion={LSU_PICKUP_REGION}
          loadingEnabled
          rotateEnabled={false}
          showsCompass
          showsPointsOfInterest
          style={styles.mapView}
          toolbarEnabled={false}
        >
          {PICKER_LOCATIONS.map((locationOption) => {
            const selected = selectedId === locationOption.id;
            return (
              <Marker
                key={locationOption.id}
                coordinate={locationOption.coordinate}
                description={locationOption.address}
                onPress={() => setSelectedId(locationOption.id)}
                title={locationOption.name}
              >
                <View style={styles.realMapMarker}>
                  <Ionicons
                    name="location-sharp"
                    size={selected ? 36 : 31}
                    color={selected ? colors.primaryDark : colors.primary}
                  />
                  <View style={styles.realMapMarkerDot} />
                </View>
              </Marker>
            );
          })}
        </MapView>
        {selectedLocation ? (
          <View style={styles.mapSelectionCard} pointerEvents="none">
            <Text style={styles.mapSelectionTitle}>{selectedLocation.name}</Text>
            <Text style={styles.mapSelectionMeta}>{selectedLocation.distance}</Text>
          </View>
        ) : (
          <View style={styles.mapSelectionCard} pointerEvents="none">
            <Text style={styles.mapSelectionTitle}>
              Pick a spot on the map or from the list
            </Text>
          </View>
        )}
      </View>

      <View style={styles.locationTabs}>
        {(['Nearby', 'Previous', 'Favorites'] as LocationTab[]).map((nextTab) => (
          <Pressable
            key={nextTab}
            onPress={() => setTab(nextTab)}
            style={styles.locationTab}
          >
            <Text
              style={[
                styles.locationTabText,
                tab === nextTab && styles.locationTabTextOn,
              ]}
            >
              {nextTab}
            </Text>
            {tab === nextTab ? <View style={styles.locationTabLine} /> : null}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.locationList}>
        {locations.length > 0 ? (
          locations.map((locationOption) => {
            const selected = selectedId === locationOption.id;
            const favorite = favorites.has(locationOption.id);
            return (
              <Pressable
                key={locationOption.id}
                onPress={() => setSelectedId(locationOption.id)}
                style={styles.pickerLocationRow}
              >
                <View style={styles.pickerLocationCopy}>
                  <Text style={styles.pickerLocationName}>{locationOption.name}</Text>
                  <Text style={styles.pickerLocationMeta}>{locationOption.address}</Text>
                  <Text style={styles.pickerLocationMeta}>{locationOption.distance}</Text>
                </View>
                <View style={[styles.pickerRadio, selected && styles.pickerRadioOn]}>
                  {selected ? <View style={styles.pickerRadioInner} /> : null}
                </View>
                <Pressable
                  accessibilityLabel={
                    favorite ? 'Remove from favorite locations' : 'Save favorite location'
                  }
                  hitSlop={10}
                  onPress={() => toggleFavorite(locationOption.id)}
                  style={styles.favoriteLocationButton}
                >
                  <Ionicons
                    name={favorite ? 'heart' : 'heart-outline'}
                    size={28}
                    color={favorite ? colors.error : colors.textPrimary}
                  />
                </Pressable>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.emptyLocations}>No favorite locations yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MethodCard({
  active,
  disabled,
  icon,
  onPress,
  subtitle,
  title,
}: {
  active: boolean;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.methodCard,
        active && styles.activeCard,
        disabled && styles.methodCardDisabled,
      ]}
    >
      <View style={styles.radioColumn}>
        <View
          style={[
            styles.radioOuter,
            active && styles.radioOuterOn,
            disabled && styles.radioOuterDisabled,
          ]}
        >
          {active ? <View style={styles.radioInner} /> : null}
        </View>
      </View>
      <View style={styles.locationCopy}>
        <Text style={[styles.methodTitle, disabled && styles.methodTitleDisabled]}>
          {title}
        </Text>
        <Text
          style={[
            styles.methodSubtitle,
            disabled && styles.methodSubtitleComingSoon,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name={icon}
        size={22}
        color={
          disabled
            ? colors.textMuted
            : active
              ? colors.primary
              : colors.textSecondary
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  pickerSafe: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  pickerHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  pickerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  mapCanvas: {
    height: 270,
    overflow: 'hidden',
    backgroundColor: '#E8EEF6',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  realMapMarker: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realMapMarkerDot: {
    position: 'absolute',
    top: 14,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  mapSelectionCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapSelectionTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  mapSelectionMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  locationTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: '#F7F7FB',
  },
  locationTab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 9,
  },
  locationTabText: {
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  locationTabTextOn: {
    color: colors.textPrimary,
  },
  locationTabLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.primary,
  },
  locationList: {
    paddingBottom: spacing.xxl,
  },
  pickerLocationRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E8EE',
    paddingHorizontal: spacing.md,
    backgroundColor: '#F7F7FB',
  },
  pickerLocationCopy: {
    flex: 1,
    paddingRight: 12,
  },
  pickerLocationName: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  pickerLocationMeta: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  pickerRadio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 22,
  },
  pickerRadioOn: {
    borderColor: colors.textPrimary,
  },
  pickerRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textPrimary,
  },
  favoriteLocationButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLocations: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 15,
    padding: spacing.lg,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.2,
  },
  stepText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 5,
  },
  headerSide: {
    width: 24,
  },
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
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: 24,
    paddingBottom: 156,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 9,
  },
  locationsLabel: {
    marginTop: 18,
  },
  methodCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  activeCard: {
    borderColor: '#C9BFFF',
    backgroundColor: '#FAF8FF',
  },
  radioColumn: {
    width: 30,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterOn: {
    borderColor: colors.primary,
  },
  radioOuterDisabled: {
    borderColor: colors.border,
  },
  methodCardDisabled: {
    opacity: 0.85,
    backgroundColor: colors.chipBg,
  },
  methodTitleDisabled: {
    color: colors.textMuted,
  },
  methodSubtitleComingSoon: {
    color: colors.error,
    fontFamily: fonts.bold,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  pickerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerSearchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    paddingVertical: 4,
  },
  pickerConfirmDisabled: {
    opacity: 0.4,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  locationCopy: {
    flex: 1,
  },
  methodTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  methodSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  locationCard: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 7,
    paddingHorizontal: 14,
  },
  locationTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  locationDistance: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  otherLocation: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    paddingHorizontal: 14,
  },
  otherCopy: {
    flex: 1,
    paddingVertical: 10,
  },
  otherText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  otherMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 3,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
