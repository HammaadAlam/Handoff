/**
 * Meetup time & place — buyer vs seller actions + map preview.
 */
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeetupMapPreview } from '@/components/MeetupMapPreview';
import { RemoteImage } from '@/components/RemoteImage';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';
import type { RootStackParamList } from '@/navigation/types';

export function MeetupDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'MeetupDetails'>>();
  const {
    role,
    title,
    price,
    imageUrl,
    location = 'LSU Student Union',
    timeLabel = 'Today - 6:30PM',
  } = params;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Meetup Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <RemoteImage uri={imageUrl} style={styles.thumb} />
            <View>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemPrice}>{price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Location</Text>
          <View style={styles.rowIcon}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.rowText}>{location}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Time</Text>
          <View style={styles.rowIcon}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.rowText}>{timeLabel}</Text>
          </View>

          <View style={styles.mapSection}>
            <MeetupMapPreview location={location} />
          </View>

          {role === 'seller' ? (
            <Pressable style={styles.btnPurple}>
              <Text style={styles.btnPurpleText}>Suggest Meetup Details</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={styles.btnWhite}>
                <Text style={styles.btnWhiteText}>Confirm Details</Text>
              </Pressable>
              <Pressable style={styles.btnPurple}>
                <Text style={styles.btnPurpleText}>Suggest New Details</Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.disclaimer}>
          <Text style={styles.star}>*</Text>
          For your safety, we recommend completing exchanges in well-lit public locations on
          campus.
        </Text>
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
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.header,
    fontSize: 18,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.bannerTint,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  itemTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    marginTop: 4,
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  label: {
    fontFamily: fonts.bold,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  mapSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  btnPurple: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPurpleText: {
    ...typography.button,
    color: '#FFF',
  },
  btnWhite: {
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  btnWhiteText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  disclaimer: {
    marginTop: spacing.lg,
    ...typography.caption,
    lineHeight: 18,
    color: colors.primary,
    paddingHorizontal: spacing.xs,
  },
  star: {
    color: colors.error,
  },
});
