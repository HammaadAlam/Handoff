/**
 * Entry: choose Quick List or manual listing.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goHomeFromCreateFlow } from '@/navigation/goHomeFromCreateFlow';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

export function CreateEntryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityLabel="Close create listing"
          hitSlop={12}
          onPress={() => goHomeFromCreateFlow(navigation)}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.title}>Create a Listing</Text>
          <Text style={styles.subtitle}>
            Choose how you want to list your item on Handoff.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('CameraCapture', { mode: 'quick' })}
          style={styles.optionPress}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.quickCard}
          >
            <View style={styles.recommendedPill}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>

            <View style={styles.optionRow}>
              <View style={styles.quickIcon}>
                <Ionicons name="camera-outline" size={28} color={colors.textInverse} />
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.quickTitle}>Quick List</Text>
                <Text style={styles.quickBody}>
                  Snap a few photos and we will auto-fill the details.
                </Text>
                <View style={styles.timeRow}>
                  <Ionicons name="flash" size={15} color={colors.textInverse} />
                  <Text style={styles.timeText}>Takes ~10 seconds</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={26} color={colors.textInverse} />
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('CameraCapture', { mode: 'manual' })}
          style={[styles.optionPress, styles.manualCard]}
        >
          <View style={styles.manualIcon}>
            <Ionicons name="create-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.optionCopy}>
            <Text style={styles.manualTitle}>Create Manually</Text>
            <Text style={styles.manualBody}>Add photos, details, and price yourself.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>Why Quick List?</Text>
          <View style={styles.whyRow}>
            <Ionicons name="sparkles-outline" size={17} color={colors.primary} />
            <Text style={styles.whyText}>AI estimates save you time</Text>
          </View>
          <View style={styles.whyRow}>
            <Ionicons name="pencil-outline" size={17} color={colors.primary} />
            <Text style={styles.whyText}>Edit everything before posting</Text>
          </View>
          <View style={styles.whyRow}>
            <Ionicons name="people-outline" size={17} color={colors.primary} />
            <Text style={styles.whyText}>Trusted by 10K+ students</Text>
          </View>
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
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: spacing.xxl,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 260,
    textAlign: 'center',
  },
  optionPress: {
    borderRadius: 18,
    marginBottom: 14,
  },
  quickCard: {
    minHeight: 160,
    borderRadius: 18,
    justifyContent: 'center',
    padding: 18,
  },
  recommendedPill: {
    position: 'absolute',
    top: 14,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recommendedText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  optionCopy: {
    flex: 1,
  },
  quickTitle: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  quickBody: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 9,
  },
  timeText: {
    color: colors.textInverse,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  manualCard: {
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F6F4FE',
    padding: 18,
  },
  manualIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECE8FF',
  },
  manualTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  manualBody: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  whyCard: {
    borderRadius: 18,
    backgroundColor: '#F6F4FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  whyTitle: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 4,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  whyText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
