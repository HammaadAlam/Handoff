import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import type { TicketListing } from '@/data/mockData';
import { colors, fonts } from '@/styles/theme';

type Props = {
  onPress?: () => void;
  ticket: TicketListing;
  width?: number;
};

export function TicketCard({ onPress, ticket, width }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        width != null && { width },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageShell}>
        <RemoteImage
          uri={ticket.imageUrl}
          contentFit="cover"
          style={styles.imageBackdrop}
        />
        <View style={styles.imageWash} />
        <RemoteImage
          uri={ticket.imageUrl}
          contentFit="contain"
          style={styles.image}
        />
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {ticket.title}
        </Text>
        <Text style={styles.meta}>{ticket.subtitle}</Text>
        <Text style={styles.venue}>{ticket.venue}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>{ticket.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  imageShell: {
    width: '100%',
    height: 128,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.chipBg,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  imageBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.26,
  },
  imageWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  copy: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 6,
  },
  venue: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    color: colors.primaryLight,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
});
