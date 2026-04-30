/**
 * Hero Card — UI component.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { colors, fonts } from '@/styles/theme';

type Props = {
  attendeesLabel: string;
  avatarUrls: string[];
  buttonLabel: string;
  buttonTextColor?: string;
  buttonBackgroundColor?: string;
  gradientColors?: readonly [string, string];
  imageUrl: string;
  onPress: () => void;
  subtitle: string;
  title: string;
};

const HERO_GRADIENT = ['rgba(10, 14, 40, 0.86)', 'rgba(96, 78, 221, 0.78)'] as const;

export function HeroCard({
  attendeesLabel,
  avatarUrls,
  buttonLabel,
  buttonTextColor = colors.primaryLight,
  buttonBackgroundColor = colors.surface,
  gradientColors = HERO_GRADIENT,
  imageUrl,
  onPress,
  subtitle,
  title,
}: Props) {
  return (
    <View style={styles.card}>
      <RemoteImage uri={imageUrl} style={styles.image} />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.05, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={styles.overlay}
      />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.footer}>
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: buttonBackgroundColor },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: buttonTextColor }]}>
              {buttonLabel}
            </Text>
          </Pressable>

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
    height: 150,
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.94)',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    color: colors.primaryLight,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  attendees: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginLeft: 6,
  },
});
