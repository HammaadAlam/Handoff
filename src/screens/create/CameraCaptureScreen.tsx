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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CreateListingStackParamList } from '@/navigation/types';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

const ZOOMS = ['.5', '1x', '2', '5'] as const;
const ZOOM_VALUE_BY_LABEL: Record<(typeof ZOOMS)[number], number> = {
  '.5': 0,
  '1x': 0.12,
  '2': 0.35,
  '5': 0.72,
};

export function CameraCaptureScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
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
      <CameraView
        ref={camRef}
        style={styles.viewfinder}
        facing={facing}
        flash={flash}
        zoom={ZOOM_VALUE_BY_LABEL[zoomLabel as (typeof ZOOMS)[number]] ?? 0.12}
        onCameraReady={() => setReady(true)}
      />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.topIconBtn}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </Pressable>
          <View style={styles.topRight}>
            <Pressable
              onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
              style={styles.topIconBtn}
              hitSlop={10}
            >
              <Ionicons
                name={flash === 'on' ? 'flash' : 'flash-off'}
                size={20}
                color="#FFF"
              />
            </Pressable>
            <Pressable style={styles.topIconBtn} hitSlop={10}>
              <Ionicons name="options" size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.zoomWrap}>
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
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.shutterRow}>
            <Pressable style={styles.sideGhost} />
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
            <Pressable
              style={styles.sideGhost}
              onPress={() =>
                setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
              }
            >
              <Ionicons name="camera-reverse-outline" size={28} color="#FFF" />
            </Pressable>
          </View>

          <View style={styles.modePill}>
            <Text style={styles.modeTextMuted}>VIDEO</Text>
            <Text style={styles.modeTextOn}>PHOTO</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 2,
    zIndex: 3,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    flex: 1,
    backgroundColor: '#111',
  },
  zoomWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 88,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  zoomChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomChipOn: {
    backgroundColor: '#FFC94A',
  },
  zoomText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  zoomTextOn: {
    color: '#1A1A1A',
  },
  bottomBar: {
    backgroundColor: '#000',
    paddingTop: 2,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  sideGhost: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#D8D8D8',
  },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF',
  },
  modePill: {
    marginTop: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  modeTextMuted: {
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.7)',
  },
  modeTextOn: {
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    color: '#FFC94A',
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
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    color: '#FFF',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    color: colors.link,
    fontFamily: fonts.semiBold,
  },
});
