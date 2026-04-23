/**
 * Meet Up step: choose fulfillment method and campus pickup spot.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
    address: '310 LSU Student Union',
    coordinate: { latitude: 30.4123, longitude: -91.1789 },
    distance: '0.3 mi',
  },
  {
    id: 'pelican-lakes',
    name: 'Pelican Lakes',
    address: '783 Pelican Dr',
    coordinate: { latitude: 30.3978, longitude: -91.1898 },
    distance: '2.5 mi',
  },
  {
    id: 'cedar-hall',
    name: 'Cedar Hall LSU',
    address: '449 Aster St',
    coordinate: { latitude: 30.4147, longitude: -91.1714 },
    distance: '3.5 mi',
  },
  {
    id: 'law-library',
    name: 'LSU Law Library',
    address: '1 LSU Campus Dr',
    coordinate: { latitude: 30.4139, longitude: -91.1752 },
    distance: '0.6 mi',
  },
  {
    id: 'war-memorial',
    name: 'War Memorial Tower',
    address: 'Tower Dr',
    coordinate: { latitude: 30.4142, longitude: -91.1806 },
    distance: '0.4 mi',
  },
  {
    id: 'parade-ground',
    name: 'Parade Ground',
    address: 'Highland Rd',
    coordinate: { latitude: 30.4137, longitude: -91.1782 },
    distance: '0.5 mi',
  },
  {
    id: 'union-square',
    name: 'Union Square Garage',
    address: 'Union Square',
    coordinate: { latitude: 30.4111, longitude: -91.1762 },
    distance: '0.7 mi',
  },
];

function StepProgress({ active }: { active: number }) {
  return (
    <View style={styles.progressRow}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View
          key={step}
          style={[styles.progressTrack, step <= active && styles.progressTrackActive]}
        />
      ))}
    </View>
  );
}

export function PickupLocationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } =
    useRoute<RouteProp<CreateListingStackParamList, 'PickupLocation'>>();
  const draft = mergeCreateListingDraft(params?.draft);
  const [method, setMethod] = useState<MeetupMethod>(draft.meetupMethod);
  const [location, setLocation] = useState(draft.meetupLocation);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const continueFlow = () => {
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
          <Text style={styles.stepText}>Step 5 of 5</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <StepProgress active={5} />

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
          active={method === 'ship'}
          icon="cube-outline"
          onPress={() => setMethod('ship')}
          subtitle="Ship to buyer"
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
          <Text style={styles.otherText}>Choose another location</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={continueFlow}>
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
  const [selectedId, setSelectedId] = useState(
    initialSelection?.id ?? PICKER_LOCATIONS[0].id,
  );
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set([PICKER_LOCATIONS[0].id]),
  );

  const locations =
    tab === 'Nearby'
      ? PICKER_LOCATIONS.slice(0, 3)
      : tab === 'Previous'
        ? PICKER_LOCATIONS.slice(3, 6)
        : PICKER_LOCATIONS.filter((candidate) => favorites.has(candidate.id));

  const selectedLocation =
    PICKER_LOCATIONS.find((candidate) => candidate.id === selectedId) ??
    PICKER_LOCATIONS[0];

  useEffect(() => {
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
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Ionicons name="search-outline" size={26} color={colors.textPrimary} />
        <Text style={styles.pickerTitle}>Choose Pickup Location</Text>
        <Pressable onPress={() => onConfirm(selectedLocation)} hitSlop={12}>
          <Ionicons name="checkmark" size={28} color={colors.textPrimary} />
        </Pressable>
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
                    size={selected ? 46 : 40}
                    color={selected ? colors.primaryDark : colors.primary}
                  />
                  <View style={styles.realMapMarkerDot} />
                </View>
              </Marker>
            );
          })}
        </MapView>
        <View style={styles.mapSelectionCard} pointerEvents="none">
          <Text style={styles.mapSelectionTitle}>{selectedLocation.name}</Text>
          <Text style={styles.mapSelectionMeta}>{selectedLocation.distance}</Text>
        </View>
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
                    size={32}
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
  icon,
  onPress,
  subtitle,
  title,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.methodCard, active && styles.activeCard]}>
      <View style={styles.radioColumn}>
        <View style={[styles.radioOuter, active && styles.radioOuterOn]}>
          {active ? <View style={styles.radioInner} /> : null}
        </View>
      </View>
      <View style={styles.locationCopy}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name={icon} size={22} color={active ? colors.primary : colors.textSecondary} />
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
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  pickerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  mapCanvas: {
    height: 250,
    overflow: 'hidden',
    backgroundColor: '#E8EEF6',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  realMapMarker: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realMapMarkerDot: {
    position: 'absolute',
    top: 18,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  mapSelectionCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mapSelectionTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  mapSelectionMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
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
    paddingTop: 20,
    paddingBottom: 13,
  },
  locationTabText: {
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  locationTabTextOn: {
    color: colors.textPrimary,
  },
  locationTabLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  locationList: {
    paddingBottom: spacing.xxl,
  },
  pickerLocationRow: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    fontSize: 18,
    lineHeight: 24,
  },
  pickerLocationMeta: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 24,
  },
  pickerRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 26,
  },
  pickerRadioOn: {
    borderColor: colors.textPrimary,
  },
  pickerRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textPrimary,
  },
  favoriteLocationButton: {
    width: 42,
    height: 42,
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
    marginTop: 24,
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
    paddingTop: 34,
    paddingBottom: 120,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 12,
  },
  locationsLabel: {
    marginTop: 24,
  },
  methodCard: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    paddingHorizontal: 16,
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
    marginTop: 4,
  },
  locationCard: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    paddingHorizontal: 16,
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
    marginTop: 4,
  },
  otherLocation: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  otherText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    minHeight: 52,
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
