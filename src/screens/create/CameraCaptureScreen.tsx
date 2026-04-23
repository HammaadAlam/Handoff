/**
 * Add photos: first listing step for quick and manual flows.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';
import { RemoteImage } from '@/components/RemoteImage';

const MAX_PHOTOS = 10;
const GRID_GAP = 12;

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

export function CameraCaptureScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { width } = useWindowDimensions();
  const { params } =
    useRoute<RouteProp<CreateListingStackParamList, 'CameraCapture'>>();
  const mode = params?.mode ?? 'quick';
  const [photos, setPhotos] = useState<string[]>([]);
  const tileSize = Math.floor((width - spacing.md * 2 - GRID_GAP * 2) / 3);
  const canContinue = photos.length > 0;
  const visiblePhotoSlots = Math.min(photos.length + 1, MAX_PHOTOS);

  const addPhoto = (uri: string) => {
    setPhotos((current) => [...current, uri].slice(0, MAX_PHOTOS));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access', 'Allow camera access to take listing photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      addPhoto(result.assets[0].uri);
    }
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo library', 'Allow photo library access to choose photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      selectionLimit: Math.max(MAX_PHOTOS - photos.length, 1),
    });

    if (!result.canceled) {
      setPhotos((current) =>
        [...current, ...result.assets.map((asset) => asset.uri)].slice(0, MAX_PHOTOS),
      );
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const continueFlow = () => {
    if (!canContinue) {
      Alert.alert('Add a photo', 'Add at least one picture before continuing.');
      return;
    }

    const imageUri = photos[0];
    const draft = { imageUri };

    if (mode === 'quick') {
      navigation.navigate('ReviewDetails', { draft });
      return;
    }

    navigation.navigate('ListingDetails', { mode: 'manual', draft });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Photos</Text>
          <Text style={styles.stepText}>Step 1 of 5</Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <StepProgress active={1} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.helper}>Add up to 10 photos. The more, the better!</Text>

        <View style={styles.grid}>
          <Pressable
            style={[styles.actionTile, { width: tileSize, height: tileSize }]}
            onPress={takePhoto}
          >
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
            <Text style={styles.actionText}>Take Photo</Text>
          </Pressable>

          <Pressable
            style={[styles.actionTile, { width: tileSize, height: tileSize }]}
            onPress={choosePhoto}
          >
            <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
            <Text style={styles.actionTextDark}>Choose from Library</Text>
          </Pressable>

          {Array.from({ length: visiblePhotoSlots }).map((_, index) => {
            const uri = photos[index];
            return (
              <View
                key={`${uri ?? 'empty'}-${index}`}
                style={[
                  styles.photoTile,
                  { width: tileSize, height: tileSize },
                  !uri && styles.emptyTile,
                ]}
              >
                {uri ? (
                  <>
                    <RemoteImage uri={uri} style={styles.photo} />
                    <Pressable
                      accessibilityLabel="Remove photo"
                      onPress={() => removePhoto(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close" size={15} color={colors.textInverse} />
                    </Pressable>
                  </>
                ) : (
                  <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.countText}>
          Photos: {photos.length}/{MAX_PHOTOS}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityState={{ disabled: !canContinue }}
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
          onPress={continueFlow}
        >
          <Text
            style={[
              styles.primaryButtonText,
              !canContinue && styles.primaryButtonTextDisabled,
            ]}
          >
            Next: Details
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
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
    paddingTop: 30,
    paddingBottom: 210,
  },
  helper: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  actionTile: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DED6FF',
    backgroundColor: '#F8F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  actionText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  actionTextDark: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  photoTile: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: '#FAFAFC',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  countText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
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
  primaryButtonDisabled: {
    backgroundColor: colors.border,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  primaryButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
