/**
 * Entry: Quick List (camera + estimate) vs Create Manually.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import type { CreateListingStackParamList } from '@/navigation/types';
import { fonts, colors, radii, shadows, spacing, typography } from '@/styles/theme';

export function CreateEntryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headBlock}>
        <Text style={styles.title}>Create a Listing</Text>
        <Text style={styles.subtitle}>
          Choose how you want to list your item on Handoff.
        </Text>
      </View>

      <Pressable
        style={styles.cardPress}
        onPress={() => navigation.navigate('CameraCapture')}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={28} color="#FFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Quick List</Text>
            <Text style={styles.cardSub}>
              Take a photo and we&apos;ll estimate title, category, and price
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFF" />
        </LinearGradient>
      </Pressable>

      <Pressable
        style={styles.cardPress}
        onPress={() =>
          navigation.navigate('ListingDetails', { mode: 'manual' })
        }
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="create-outline" size={28} color="#FFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Create Manually</Text>
            <Text style={styles.cardSub}>Enter photos, details, and price yourself</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFF" />
        </LinearGradient>
      </Pressable>

      <View style={styles.banner}>
        <View style={styles.bannerLogo}>
          <AppLogo width={56} height={42} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerMain}>
            Quick List uses AI-style estimates; manual listing gives you full
            control over category, condition, size, and brand.
          </Text>
          <Text style={styles.bannerNote}>
            Note: estimates are for demo purposes and may be inaccurate.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  headBlock: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.header,
    fontSize: 24,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  cardPress: {
    marginBottom: spacing.lg,
    borderRadius: radii.button,
    overflow: 'hidden',
    ...shadows.soft,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.bannerTint,
    borderRadius: radii.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerLogo: {
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
  },
  bannerMain: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  bannerNote: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
    color: colors.textSecondary,
  },
});
