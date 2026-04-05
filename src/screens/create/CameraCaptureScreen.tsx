/**
 * Quick List camera — capture a photo, then continue to listing details with estimate.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, spacing, typography } from '@/styles/theme';

const ZOOMS = ['.5', '1x', '2', '5'] as const;

export function CameraCaptureScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoomLabel, setZoomLabel] = useState<string>('1x');
  const [capturing, setCapturing] = useState(false);

  const takePicture = useCallback(async () => {
    if (!camRef.current || !ready) return;
    try {
      setCapturing(true);
      const photo = await camRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        navigation.navigate('ListingDetails', {
          mode: 'quick',
          capturedImageUri: photo.uri,
        });
      }
    } catch (e) {
      Alert.alert(
        'Could not capture',
        'Try again or use Create Manually from the previous screen.',
      );
    } finally {
      setCapturing(false);
    }
  }, [navigation, ready]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <Text style={styles.permissionText}>
          Camera access lets Handoff estimate your listing from a photo.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Allow camera</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            navigation.replace('ListingDetails', { mode: 'manual' })
          }
        >
          <Text style={styles.link}>Enter details manually instead</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={28} color="#FFF" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
        >
          <Ionicons
            name={flash === 'on' ? 'flash' : 'flash-off'}
            size={26}
            color="#FFF"
          />
        </Pressable>
      </SafeAreaView>

      <CameraView
        ref={camRef}
        style={styles.viewfinder}
        facing="back"
        flash={flash}
        onCameraReady={() => setReady(true)}
      />

      <View style={styles.zoomRow}>
        {ZOOMS.map((z) => (
          <Pressable
            key={z}
            onPress={() => setZoomLabel(z)}
            style={[styles.zoomChip, zoomLabel === z && styles.zoomChipOn]}
          >
            <Text style={[styles.zoomText, zoomLabel === z && styles.zoomTextOn]}>
              {z}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.shutterOuter}
          onPress={takePicture}
          disabled={!ready || capturing}
        >
          {capturing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>
        <View style={styles.modePill}>
          <Text style={styles.modeText}>PHOTO</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 2,
  },
  viewfinder: {
    flex: 1,
    backgroundColor: '#111',
  },
  zoomRow: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  zoomChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomChipOn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  zoomText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  zoomTextOn: {
    color: '#FFF',
  },
  bottomBar: {
    backgroundColor: '#F2F2F2',
    paddingTop: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#000',
  },
  modePill: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#333',
  },
  permissionWrap: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  permissionText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    color: colors.link,
    fontWeight: '600',
  },
});
