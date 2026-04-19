import type { Region } from 'react-native-maps';

/** LSU Student Union, Baton Rouge — default campus meetup */
const LSU_STUDENT_UNION = { latitude: 30.4134, longitude: -91.1792 };

/** Known location strings → coordinates (extend as you add venues) */
const OVERRIDES: Record<string, { latitude: number; longitude: number }> = {
  'lsu student union': LSU_STUDENT_UNION,
};

/**
 * Map region + pin for a meetup label. Unknown strings use the LSU default.
 */
export function regionForMeetupLocation(location: string): Region {
  const key = location.trim().toLowerCase();
  const center = OVERRIDES[key] ?? LSU_STUDENT_UNION;
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };
}
