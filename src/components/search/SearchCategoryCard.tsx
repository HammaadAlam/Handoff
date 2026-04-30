/**
 * Search Category Card — UI component.
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { colors, fonts } from '@/styles/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  imageUrl: string;
  subtitle: string;
  title: string;
  onPress?: () => void;
};

export function SearchCategoryCard({
  icon,
  imageUrl,
  subtitle,
  title,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <RemoteImage style={styles.image} uri={imageUrl} />
      <LinearGradient
        colors={['rgba(12, 16, 32, 0.08)', 'rgba(12, 16, 32, 0.76)']}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.overlay}
      />
      <View style={styles.content}>
        <Ionicons color={colors.textInverse} name={icon} size={20} />
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    padding: 14,
    justifyContent: 'flex-end',
  },
  copy: {
    gap: 3,
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.textInverse,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.92)',
    maxWidth: '82%',
  },
});
