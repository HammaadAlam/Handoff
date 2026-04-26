import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

export function EventCreateSuccessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={40} color={colors.surface} />
        </View>
        <Text style={styles.title}>Event Posted</Text>
        <Text style={styles.body}>
          Your event is now live and will appear in the campus events feed.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.replace('EventsCalendar')}
        >
          <Text style={styles.buttonText}>Go to Events</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  iconWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  title: {
    marginTop: 22,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 30,
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: 26,
    paddingTop: 10,
  },
  button: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.textInverse, fontFamily: fonts.bold, fontSize: 15 },
});
