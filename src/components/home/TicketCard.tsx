import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import type { TicketListing } from '@/data/mockData';
import { colors, fonts, radii } from '@/styles/theme';

type Props = {
  badgeLabel: string;
  onPress?: () => void;
  ticket: TicketListing;
  width?: number;
};

export function TicketCard({ badgeLabel, onPress, ticket, width }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        width != null && { width },
        pressed && styles.cardPressed,
      ]}
    >
      <RemoteImage uri={ticket.imageUrl} style={styles.image} />

      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {ticket.title}
        </Text>
        <Text style={styles.meta}>{ticket.subtitle}</Text>
        <Text style={styles.venue}>{ticket.venue}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>{ticket.price}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
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
  image: {
    width: '100%',
    height: 108,
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
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    color: colors.primaryLight,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.input,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.textInverse,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});
