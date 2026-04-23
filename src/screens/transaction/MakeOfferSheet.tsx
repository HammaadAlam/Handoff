/**
 * Make-an-offer bottom sheet — opens from ItemDetail before Conversation.
 * Backdrop fades; sheet translates (Modal `slide` would move dimmer with panel).
 */
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemoteImage } from '@/components/RemoteImage';
import { fonts, colors, radii, shadows, spacing, typography } from '@/styles/theme';

const WINDOW_H = Dimensions.get('window').height;
const SHEET_MIN_HEIGHT = Math.round(WINDOW_H * 0.86);

type Preset = { pct: number; recommended?: boolean };
const PRESETS: Preset[] = [
  { pct: 0.22 },
  { pct: 0.2, recommended: true },
  { pct: 0.17 },
];

type Props = {
  visible: boolean;
  title: string;
  imageUrl: string;
  price: string;
  variant?: string;
  /** Seller-set floor ($) that overrides the default 50% minimum when present. */
  lowestOffer?: number;
  onClose: () => void;
  onSubmit: (offerAmount: string) => void;
};

function parsePrice(price: string): number {
  const n = Number(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function MakeOfferSheet({
  visible,
  title,
  imageUrl,
  price,
  variant,
  lowestOffer,
  onClose,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const currentPrice = useMemo(() => parsePrice(price), [price]);
  /**
   * Default floor is 50% of the listing price; if the seller set a custom
   * `lowestOffer`, honor whichever is higher (never below 50%).
   */
  const floorPrice = useMemo(() => {
    const fiftyPct = currentPrice * 0.5;
    if (typeof lowestOffer === 'number' && Number.isFinite(lowestOffer)) {
      return Math.max(fiftyPct, lowestOffer);
    }
    return fiftyPct;
  }, [currentPrice, lowestOffer]);
  const recommended =
    PRESETS.find((p) => p.recommended) ?? PRESETS[Math.floor(PRESETS.length / 2)];
  const [selectedPct, setSelectedPct] = useState<number | null>(recommended.pct);
  const [amount, setAmount] = useState<string>(() =>
    (currentPrice * (1 - recommended.pct)).toFixed(2),
  );

  const sheetY = useRef(new Animated.Value(WINDOW_H)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  const numericAmount = parsePrice(amount);
  const belowFloor = currentPrice > 0 && numericAmount < floorPrice;
  const aboveList = currentPrice > 0 && numericAmount >= currentPrice;
  const valid = numericAmount > 0 && !belowFloor && !aboveList;
  const validationMessage =
    numericAmount <= 0
      ? null
      : belowFloor
        ? `Offer must be at least ${formatMoney(floorPrice)}`
        : aboveList
          ? `Offer must be less than ${formatMoney(currentPrice)}`
          : null;

  const onPickPreset = (pct: number) => {
    setSelectedPct(pct);
    setAmount((currentPrice * (1 - pct)).toFixed(2));
  };

  const onChangeAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const next =
      parts.length <= 1
        ? cleaned
        : `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`;
    setAmount(next);
    setSelectedPct(null);
  };

  const handleSend = () => {
    if (!valid) return;
    onSubmit(formatMoney(numericAmount));
  };

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: WINDOW_H,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [backdropOp, onClose, sheetY]);

  useEffect(() => {
    if (!visible) {
      sheetY.setValue(WINDOW_H);
      backdropOp.setValue(0);
      return;
    }
    sheetY.setValue(WINDOW_H);
    backdropOp.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(sheetY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 26,
        stiffness: 220,
        mass: 0.85,
      }),
    ]).start();
  }, [visible, backdropOp, sheetY]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={dismiss}
      presentationStyle="overFullScreen"
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdropWrap, { opacity: backdropOp }]}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.backdrop}
            onPress={dismiss}
            accessibilityLabel="Close make an offer"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              minHeight: SHEET_MIN_HEIGHT,
              paddingBottom: spacing.lg + insets.bottom,
              transform: [{ translateY: sheetY }],
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Pressable onPress={dismiss} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Make an offer</Text>
            <View style={styles.closeBtn} />
          </View>

          <View style={styles.itemRow}>
            <RemoteImage uri={imageUrl} style={styles.itemImage} />
            <View style={styles.itemMeta}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {title}
              </Text>
              {variant ? <Text style={styles.itemVariant}>{variant}</Text> : null}
              <Text style={styles.itemPrice}>
                Current price: {formatMoney(currentPrice)}
              </Text>
            </View>
          </View>

          <View style={styles.presetsRow}>
            {PRESETS.map((p) => {
              const selected = selectedPct === p.pct;
              const presetPrice = currentPrice * (1 - p.pct);
              return (
                <View key={p.pct} style={styles.presetCol}>
                  <Pressable
                    onPress={() => onPickPreset(p.pct)}
                    style={[styles.preset, selected && styles.presetSelected]}
                  >
                    <Text
                      style={[styles.presetPct, selected && styles.presetPctSelected]}
                    >
                      {Math.round(p.pct * 100)}% off
                    </Text>
                    <Text
                      style={[styles.presetPrice, selected && styles.presetPriceSelected]}
                    >
                      {formatMoney(presetPrice)}
                    </Text>
                  </Pressable>
                  {p.recommended ? (
                    <Text style={styles.recommended}>Recommended</Text>
                  ) : null}
                </View>
              );
            })}
          </View>

          <Text style={styles.yourOffer}>Your offer</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountPrefix}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={onChangeAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              selectTextOnFocus
            />
          </View>
          {validationMessage ? (
            <Text style={styles.validationText}>{validationMessage}</Text>
          ) : (
            <Text style={styles.floorHint}>
              Minimum offer: {formatMoney(floorPrice)}
            </Text>
          )}
          <View style={styles.divider} />

          <Pressable
            onPress={handleSend}
            disabled={!valid}
            style={({ pressed }) => [
              styles.sendBtn,
              !valid && styles.sendBtnDisabled,
              pressed && valid && styles.sendBtnPressed,
            ]}
          >
            <Text style={styles.sendBtnText}>Send offer</Text>
          </Pressable>

          <View style={styles.disclaimer}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              An offer is not a payment. If the seller accepts you'll have 24 hours
              to buy the item at your offer price.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...shadows.soft,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.header,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: radii.input,
    backgroundColor: colors.chipBg,
  },
  itemMeta: { flex: 1 },
  itemTitle: {
    ...typography.body,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemVariant: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemPrice: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  presetCol: { flex: 1, alignItems: 'center' },
  preset: {
    width: '100%',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  presetSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.bannerTint,
  },
  presetPct: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  presetPctSelected: { color: colors.primaryDark },
  presetPrice: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  presetPriceSelected: { color: colors.primaryDark },
  recommended: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  yourOffer: {
    ...typography.header,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  amountPrefix: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  floorHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  validationText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
    fontFamily: fonts.semiBold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  sendBtnPressed: { opacity: 0.9 },
  sendBtnDisabled: {
    backgroundColor: colors.chipBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 16,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
