import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { colors, fonts } from '@/styles/theme';

type Props = {
  attendeesLabel: string;
  avatarUrls: string[];
  imageUrl: string;
  onPress: () => void;
};

export function StudentEventsBanner({
  attendeesLabel,
  avatarUrls,
  imageUrl,
  onPress,
}: Props) {
  return (
    <View style={styles.card}>
      <RemoteImage uri={imageUrl} style={styles.image} />
      <LinearGradient
        colors={[
          'rgba(248,245,255,0.98)',
          'rgba(244,239,255,0.94)',
          'rgba(244,239,255,0.28)',
          'rgba(244,239,255,0)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.wash}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Student{'\n'}Created Events</Text>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.learnMoreButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.learnMoreText}>Learn More</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textInverse} />
        </Pressable>

        <View style={styles.footer}>
          <View style={styles.social}>
            <View style={styles.avatars}>
              {avatarUrls.slice(0, 3).map((uri, index) => (
                <RemoteImage
                  key={`${uri}-${index}`}
                  uri={uri}
                  style={[styles.avatar, index > 0 && styles.avatarOverlap]}
                />
              ))}
            </View>
            <Text style={styles.attendees}>{attendeesLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 196,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#F8F5FF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    width: '72%',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.extraBold,
    fontSize: 31,
    lineHeight: 33,
    letterSpacing: -1.2,
  },
  learnMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 136,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  learnMoreText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  attendees: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 15,
    flexShrink: 1,
  },
});
