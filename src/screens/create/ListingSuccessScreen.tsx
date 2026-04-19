/**
 * Post-success — reset flow and return to Home tab.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goHomeFromCreateFlow } from '@/navigation/goHomeFromCreateFlow';
import type { CreateListingStackParamList } from '@/navigation/types';
import { fonts, colors, radii, spacing, typography } from '@/styles/theme';

export function ListingSuccessScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.dim}>
        <View style={styles.card}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color="#111" />
          </View>
          <Text style={styles.title}>Congratulations 🎉</Text>
          <Text style={styles.sub}>Your listing was posted successfully</Text>
          <Pressable
            style={styles.homeBtn}
            onPress={() => goHomeFromCreateFlow(navigation)}
          >
            <Text style={styles.homeBtnText}>Back Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    textAlign: 'center',
    color: '#111',
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  homeBtn: {
    width: '100%',
    backgroundColor: '#EDE9FE',
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#111',
  },
});
