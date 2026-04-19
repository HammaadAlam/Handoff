/**
 * Listing form — media, placeholders, category/condition/size/brand, price, meetup.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionPickerModal } from '@/components/create/OptionPickerModal';
import { RemoteImage } from '@/components/RemoteImage';
import {
  LISTING_BRANDS,
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_SIZES,
} from '@/data/listingOptions';
import { PLACEHOLDER_IMAGE_URI } from '@/data/mockData';
import type { CreateListingStackParamList } from '@/navigation/types';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

type PickerKind = 'category' | 'condition' | 'size' | 'brand';

export function ListingDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const { params } = useRoute<
    RouteProp<CreateListingStackParamList, 'ListingDetails'>
  >();
  const { mode, capturedImageUri } = params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [videoCount, setVideoCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [meetupNow, setMeetupNow] = useState(true);

  const [category, setCategory] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerKind | null>(null);

  useEffect(() => {
    if (mode === 'quick' && capturedImageUri) {
      setTitle('Estimated: Item from your photo');
      setDescription(
        'We started this from your picture — edit title, description, and price before posting.',
      );
      setPhotoCount(1);
    }
  }, [mode, capturedImageUri]);

  const pickerModal = useMemo(() => {
    switch (picker) {
      case 'category':
        return {
          title: 'Category',
          options: LISTING_CATEGORIES,
          selected: category,
          onSelect: setCategory,
          onClear: () => setCategory(null),
        };
      case 'condition':
        return {
          title: 'Condition',
          options: LISTING_CONDITIONS,
          selected: condition,
          onSelect: setCondition,
          onClear: () => setCondition(null),
        };
      case 'size':
        return {
          title: 'Size',
          options: LISTING_SIZES,
          selected: size,
          onSelect: setSize,
          onClear: () => setSize(null),
        };
      case 'brand':
        return {
          title: 'Brand',
          options: LISTING_BRANDS,
          selected: brand,
          onSelect: setBrand,
          onClear: () => setBrand(null),
        };
      default:
        return null;
    }
  }, [picker, category, condition, size, brand]);

  const pickPhotos = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Allow photo library access to add images.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setPhotoCount((c) => Math.min(10, c + 1));
    }
  };

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setVideoCount((c) => Math.min(1, c + 1));
    }
  };

  const saveDraft = () => {
    Alert.alert('Saved', 'Draft saved locally (demo — not synced to a server).');
  };

  const postListing = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Add a title for your item.');
      return;
    }
    if (!category || !condition || !size || !brand) {
      Alert.alert(
        'Details needed',
        'Select category, condition, size, and brand before posting.',
      );
      return;
    }
    if (meetupNow) {
      navigation.navigate('PickupLocation');
    } else {
      navigation.navigate('ListingSuccess');
    }
  };

  const infoFields: Array<{
    key: PickerKind;
    label: string;
    value: string | null;
  }> = [
    { key: 'category', label: 'Category', value: category },
    { key: 'condition', label: 'Condition', value: condition },
    { key: 'size', label: 'Size', value: size },
    { key: 'brand', label: 'Brand', value: brand },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {pickerModal ? (
        <OptionPickerModal
          visible={picker !== null}
          title={pickerModal.title}
          options={pickerModal.options}
          selected={pickerModal.selected}
          onSelect={(v) => pickerModal.onSelect(v)}
          onClear={pickerModal.onClear}
          onClose={() => setPicker(null)}
        />
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Listing Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {mode === 'quick' && capturedImageUri ? (
          <View style={styles.estimateBanner}>
            <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
            <Text style={styles.estimateText}>
              Estimated fields — review and edit before posting.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Media</Text>
          <View style={styles.mediaRow}>
            <Pressable style={styles.mediaBox} onPress={pickVideo}>
              <Ionicons name="add" size={28} color={colors.primary} />
              <Text style={styles.mediaHint}>Upload a Video (30s max)</Text>
            </Pressable>
            <Pressable style={styles.mediaBox} onPress={pickPhotos}>
              <Ionicons name="images-outline" size={28} color={colors.primary} />
              <Text style={styles.mediaHint}>Upload Photos</Text>
            </Pressable>
          </View>
          <Text style={styles.mediaStatus}>
            Videos: {videoCount}/1 · Photos: {photoCount}/10
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sample listing photos</Text>
          <Text style={styles.helper}>
            Placeholder images — your uploads appear above when added.
          </Text>
          <View style={styles.placeholderRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.phSlot}>
                <RemoteImage
                  uri={PLACEHOLDER_IMAGE_URI}
                  style={styles.phImg}
                />
                <Text style={styles.phCap}>Sample {i + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {capturedImageUri ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick capture</Text>
            <Image source={{ uri: capturedImageUri }} style={styles.preview} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Item name..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the item..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Info</Text>
          <View style={styles.infoChipWrap}>
            {infoFields.map((field) => (
              <Pressable
                key={field.key}
                style={[styles.infoChip, field.value && styles.infoChipSelected]}
                onPress={() => setPicker(field.key)}
              >
                <Text
                  style={[
                    styles.infoChipPlus,
                    field.value && styles.infoChipPlusSelected,
                  ]}
                >
                  +
                </Text>
                <Text
                  style={[
                    styles.infoChipText,
                    field.value && styles.infoChipTextSelected,
                  ]}
                >
                  {field.value ? `${field.label}: ${field.value}` : field.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="$ 0.00"
            placeholderTextColor={colors.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Meetup method</Text>
          <Pressable
            style={styles.radioRow}
            onPress={() => setMeetupNow(true)}
          >
            <View style={[styles.radioOuter, meetupNow && styles.radioOn]}>
              {meetupNow ? <View style={styles.radioInner} /> : null}
            </View>
            <Text style={styles.radioLabel}>Choose now</Text>
          </Pressable>
          <Pressable
            style={styles.radioRow}
            onPress={() => setMeetupNow(false)}
          >
            <View style={[styles.radioOuter, !meetupNow && styles.radioOn]}>
              {!meetupNow ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radioLabel}>Choose later in chat</Text>
              <Text style={styles.hint}>
                (public meetup locations recommended)
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.saveBtn} onPress={saveDraft}>
            <Text style={styles.saveText}>Save Listing</Text>
          </Pressable>
          <Pressable style={styles.postBtn} onPress={postListing}>
            <Text style={styles.postText}>Post Listing</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.header,
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  estimateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bannerTint,
    padding: 12,
    borderRadius: radii.card,
    marginBottom: spacing.lg,
  },
  estimateText: {
    ...typography.caption,
    flex: 1,
    color: colors.primaryDark,
    fontFamily: fonts.semiBold,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  mediaBox: {
    flex: 1,
    minHeight: 104,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: radii.card,
    backgroundColor: colors.bannerTint,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mediaHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 8,
    color: colors.textSecondary,
  },
  mediaStatus: {
    ...typography.caption,
    color: colors.textMuted,
  },
  placeholderRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  phSlot: {
    flex: 1,
    alignItems: 'center',
  },
  phImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    maxHeight: 96,
    backgroundColor: colors.chipBg,
  },
  phCap: {
    ...typography.caption,
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 11,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radii.card,
    backgroundColor: colors.chipBg,
  },
  input: {
    backgroundColor: colors.bannerTint,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 120,
  },
  infoChipWrap: {
    gap: 10,
  },
  infoChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bannerTint,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoChipSelected: {
    backgroundColor: colors.primary,
  },
  infoChipPlus: {
    color: colors.primaryDark,
    fontSize: 15,
    fontFamily: fonts.bold,
    lineHeight: 16,
  },
  infoChipText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  infoChipPlusSelected: {
    color: '#FFF',
  },
  infoChipTextSelected: {
    color: '#FFF',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    ...typography.caption,
    fontFamily: fonts.bold,
    marginBottom: 6,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bannerTint,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
  },
  selectPlaceholder: {
    color: colors.textMuted,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.md,
  },
  saveBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  saveText: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  postBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  postText: {
    fontFamily: fonts.bold,
    color: '#FFF',
  },
});
