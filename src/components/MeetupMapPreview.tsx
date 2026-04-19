/**
 * Embedded map for meetup location — native MapView; web uses OSM static image + link.
 */
import { Image } from 'expo-image';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { fonts, colors, typography } from '@/styles/theme';
import { regionForMeetupLocation } from '@/utils/meetupLocationCoords';

type Props = {
  location: string;
};

export function MeetupMapPreview({ location }: Props) {
  const region = regionForMeetupLocation(location);
  const lat = region.latitude;
  const lng = region.longitude;

  const openInMaps = () => {
    const q = encodeURIComponent(location);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };

  if (Platform.OS === 'web') {
    const staticUri = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=600x280&maptype=mapnik&markers=${lat},${lng},lightblue1`;
    return (
      <Pressable
        onPress={() =>
          void Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
          )
        }
        style={styles.webWrap}
        accessibilityRole="button"
        accessibilityLabel={`Open map for ${location}`}
      >
        <Image source={{ uri: staticUri }} style={styles.mapImage} contentFit="cover" />
        <View style={styles.webHint}>
          <Text style={styles.webHintText}>Tap to open in Maps</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={openInMaps}
      style={styles.nativeWrap}
      accessibilityRole="button"
      accessibilityLabel={`Map for ${location}. Double tap to open in Maps.`}
    >
      <MapView
        style={styles.map}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsPointsOfInterest
        mapType="standard"
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
          title={location}
        />
      </MapView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nativeWrap: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webWrap: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  webHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
  },
  webHintText: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});
