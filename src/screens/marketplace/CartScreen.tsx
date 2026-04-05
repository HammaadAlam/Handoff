/**
 * Shopping cart — adjust qty, remove, demo checkout.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { useMarketplace } from '@/context/MarketplaceContext';
import { DEFAULT_PEER_AVATAR_URI, PLACEHOLDER_IMAGE_URI } from '@/data/mockData';
import type { RootStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/styles/theme';

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    cart,
    setCartQty,
    removeFromCart,
    cartSubtotal,
    clearCart,
  } = useMarketplace();
  const [busy, setBusy] = useState(false);

  const checkout = () => {
    if (cart.length === 0) return;
    Alert.alert(
      'Checkout',
      `Total $${cartSubtotal.toFixed(2)} — demo only, no payment processed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place order',
          onPress: () => {
            setBusy(true);
            clearCart();
            setBusy(false);
            Alert.alert('Thanks!', 'Your demo order was placed.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={cart}
        keyExtractor={(line) => line.item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <RemoteImage uri={PLACEHOLDER_IMAGE_URI} style={styles.emptyImg} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Add items from a listing with &quot;Add to cart&quot;.
            </Text>
            <Pressable
              style={styles.browse}
              onPress={() =>
                navigation.navigate('Main', { screen: 'Home' })
              }
            >
              <Text style={styles.browseText}>Browse Home</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item: line }) => (
          <View style={styles.line}>
            <Pressable
              onPress={() =>
                navigation.navigate('ItemDetail', {
                  listingId: line.item.id,
                  title: line.item.title,
                  price: line.item.price,
                  imageUrl: line.item.imageUrl,
                  sellerAvatarUrl: DEFAULT_PEER_AVATAR_URI,
                })
              }
            >
              <RemoteImage uri={line.item.imageUrl} style={styles.thumb} />
            </Pressable>
            <View style={styles.lineBody}>
              <Text style={styles.lineTitle} numberOfLines={2}>
                {line.item.title}
              </Text>
              <Text style={styles.linePrice}>{line.item.price}</Text>
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => setCartQty(line.item.id, line.qty - 1)}
                >
                  <Ionicons name="remove" size={18} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.qtyNum}>{line.qty}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => setCartQty(line.item.id, line.qty + 1)}
                >
                  <Ionicons name="add" size={18} color={colors.textPrimary} />
                </Pressable>
              </View>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => removeFromCart(line.item.id)}
              accessibilityLabel="Remove"
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
        )}
      />

      {cart.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${cartSubtotal.toFixed(2)}</Text>
          </View>
          <Pressable
            style={[styles.checkout, busy && { opacity: 0.7 }]}
            onPress={checkout}
            disabled={busy}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.chipBg,
  },
  lineBody: {
    flex: 1,
    minWidth: 0,
  },
  lineTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.textPrimary,
  },
  linePrice: {
    ...typography.body,
    fontWeight: '600',
    marginTop: 4,
    color: colors.primaryDark,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBg,
  },
  qtyNum: {
    fontWeight: '700',
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyImg: {
    width: 180,
    height: 120,
    borderRadius: radii.card,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  emptyTitle: {
    ...typography.header,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  emptySub: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  browse: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.button,
  },
  browseText: {
    fontWeight: '700',
    color: '#FFF',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  checkout: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: {
    ...typography.button,
    color: '#FFF',
  },
});
