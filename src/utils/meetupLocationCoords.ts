import type { Region } from 'react-native-maps';

/** LSU Student Union, Baton Rouge — default campus meetup */
const LSU_STUDENT_UNION = { latitude: 30.4134, longitude: -91.1792 };

/** Known location strings → coordinates (extend as you add venues) */
const OVERRIDES: Record<string, { latitude: number; longitude: number }> = {
  'lsu student union': LSU_STUDENT_UNION,
  'student union': LSU_STUDENT_UNION,
  'lsu police / public safety building': { latitude: 30.4099, longitude: -91.1816 },
  'police / public safety building': { latitude: 30.4099, longitude: -91.1816 },
  'lsu barnes & noble bookstore': { latitude: 30.4113, longitude: -91.1765 },
  'barnes & noble bookstore': { latitude: 30.4113, longitude: -91.1765 },
  'lsu library / quad area': { latitude: 30.4133, longitude: -91.1777 },
  'library / quad area': { latitude: 30.4133, longitude: -91.1777 },
  'memorial tower': { latitude: 30.4142, longitude: -91.1806 },
  'lsu urec': { latitude: 30.4082, longitude: -91.1769 },
  'urec': { latitude: 30.4082, longitude: -91.1769 },
  'the 459 commons': { latitude: 30.4148, longitude: -91.1744 },
  'patrick f. taylor hall': { latitude: 30.4104, longitude: -91.1734 },
  'business education complex': { latitude: 30.4107, longitude: -91.1858 },
  'lsu law center': { latitude: 30.414, longitude: -91.1752 },
  'law center': { latitude: 30.414, longitude: -91.1752 },
  'student health center': { latitude: 30.4118, longitude: -91.1702 },
  'tiger stadium gate area': { latitude: 30.4119, longitude: -91.1838 },
  'mike the tiger habitat': { latitude: 30.4125, longitude: -91.1834 },
  'parade ground': { latitude: 30.4137, longitude: -91.1782 },
  'nicholson gateway': { latitude: 30.4088, longitude: -91.1851 },
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
