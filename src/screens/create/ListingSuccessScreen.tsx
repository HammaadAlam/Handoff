/**
 * Listing posted confirmation.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goHomeFromCreateFlow } from '@/navigation/goHomeFromCreateFlow';
import type { CreateListingStackParamList } from '@/navigation/types';
import { colors, fonts, spacing } from '@/styles/theme';

const CONFETTI_PIECES = [
  { color: '#F6B24A', delay: 0, drift: 14, duration: 2600, left: 28, radius: 2, rotateFrom: '-18deg', rotateTo: '62deg', top: -18, width: 9, height: 9 },
  { color: '#F06A8A', delay: 180, drift: -18, duration: 2800, left: 70, radius: 3, rotateFrom: '18deg', rotateTo: '-84deg', top: -30, width: 11, height: 11 },
  { color: '#8B82E0', delay: 340, drift: 20, duration: 2700, left: 88, radius: 3, rotateFrom: '-34deg', rotateTo: '118deg', top: -8, width: 20, height: 5 },
  { color: '#80B7E8', delay: 520, drift: -12, duration: 2900, left: 108, radius: 3, rotateFrom: '14deg', rotateTo: '-120deg', top: -36, width: 7, height: 18 },
  { color: '#F4D35E', delay: 680, drift: 16, duration: 2500, left: 152, radius: 3, rotateFrom: '-14deg', rotateTo: '88deg', top: -22, width: 12, height: 12 },
  { color: '#F06A8A', delay: 840, drift: -20, duration: 3000, left: 186, radius: 3, rotateFrom: '24deg', rotateTo: '-100deg', top: -12, width: 9, height: 15 },
  { color: '#8B82E0', delay: 1000, drift: 18, duration: 2750, left: 218, radius: 3, rotateFrom: '-20deg', rotateTo: '92deg', top: -34, width: 18, height: 5 },
  { color: '#F6B24A', delay: 1160, drift: -10, duration: 2650, left: 242, radius: 2, rotateFrom: '15deg', rotateTo: '-74deg', top: -18, width: 10, height: 10 },
  { color: '#80B7E8', delay: 1320, drift: 16, duration: 2850, left: 56, radius: 3, rotateFrom: '32deg', rotateTo: '140deg', top: -28, width: 16, height: 5 },
  { color: '#F4D35E', delay: 1480, drift: -14, duration: 2550, left: 98, radius: 4, rotateFrom: '0deg', rotateTo: '-90deg', top: -12, width: 8, height: 8 },
  { color: '#F06A8A', delay: 1640, drift: 18, duration: 2950, left: 176, radius: 3, rotateFrom: '-30deg', rotateTo: '116deg', top: -26, width: 16, height: 5 },
  { color: '#8B82E0', delay: 1800, drift: -16, duration: 2700, left: 222, radius: 4, rotateFrom: '0deg', rotateTo: '-116deg', top: -10, width: 8, height: 8 },
] as const;

export function ListingSuccessScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<CreateListingStackParamList>>();
  const confettiProgress = useRef(
    CONFETTI_PIECES.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const loops = confettiProgress.map((progress, index) => {
      const piece = CONFETTI_PIECES[index];
      progress.setValue(0);

      return Animated.loop(
        Animated.sequence([
          Animated.delay(piece.delay),
          Animated.timing(progress, {
            toValue: 1,
            duration: piece.duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    });

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [confettiProgress]);

  const listAnother = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CreateEntry' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.confettiWrap}>
          {CONFETTI_PIECES.map((piece, index) => {
            const progress = confettiProgress[index];
            const translateY = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 210],
            });
            const translateX = progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, piece.drift, piece.drift * -0.35],
            });
            const rotate = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [piece.rotateFrom, piece.rotateTo],
            });
            const opacity = progress.interpolate({
              inputRange: [0, 0.12, 0.78, 1],
              outputRange: [0, 1, 1, 0],
            });

            return (
              <Animated.View
                key={`${piece.color}-${piece.left}-${index}`}
                style={[
                  styles.confettiPiece,
                  {
                    backgroundColor: piece.color,
                    borderRadius: piece.radius,
                    height: piece.height,
                    left: piece.left,
                    opacity,
                    top: piece.top,
                    transform: [{ translateX }, { translateY }, { rotate }],
                    width: piece.width,
                  },
                ]}
              />
            );
          })}
          <Ionicons
            name="sparkles"
            size={19}
            color="#8B82E0"
            style={[styles.confettiSparkle, styles.confettiSparkleLeft]}
          />
          <Ionicons
            name="sparkles"
            size={16}
            color="#8B82E0"
            style={[styles.confettiSparkle, styles.confettiSparkleRight]}
          />
          <View style={styles.successHalo}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={44} color={colors.textInverse} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your listing is live!</Text>
        <Text style={styles.subtitle}>
          Nice work. Buyers on campus will see it now.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => goHomeFromCreateFlow(navigation)}>
          <Text style={styles.primaryButtonText}>View Listing</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => Alert.alert('Share Listing', 'Sharing is coming soon.')}
        >
          <Ionicons name="share-social-outline" size={19} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Share Listing</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={listAnother}>
          <Ionicons name="add" size={22} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>List Another Item</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  confettiWrap: {
    width: 280,
    height: 178,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiPiece: {
    position: 'absolute',
  },
  confettiSparkle: {
    position: 'absolute',
  },
  confettiSparkleLeft: {
    left: 82,
    top: 54,
    transform: [{ rotate: '-18deg' }],
  },
  confettiSparkleRight: {
    right: 74,
    top: 88,
    transform: [{ rotate: '14deg' }],
  },
  successHalo: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2EEFF',
  },
  checkCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 250,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.md,
    paddingBottom: 18,
    gap: 14,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  secondaryButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 10,
    backgroundColor: '#F7F5FE',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
