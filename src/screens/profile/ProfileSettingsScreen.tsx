/**
 * Profile settings — grouped lists (activity, settings, support) + sign out.
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useViewerProfileId } from '@/hooks/useViewerProfileId';
import type { RootStackParamList } from '@/navigation/types';
import { fetchListingsByUserId } from '@/services/listings';
import { fonts, colors, spacing, typography } from '@/styles/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const signOutTint = '#E85D4C';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  badge?: string;
};

function SettingsRow({
  icon,
  label,
  onPress,
  isLast,
  badge,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowWithSeparator,
        pressed && styles.rowPressed,
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.textPrimary} />
      <Text style={styles.rowLabel}>{label}</Text>
      {badge !== undefined ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
        style={styles.chevron}
      />
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export function ProfileSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const viewerProfileId = useViewerProfileId();
  const [listingsCount, setListingsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!viewerProfileId) {
        if (!cancelled) setListingsCount(0);
        return;
      }
      const listings = await fetchListingsByUserId(viewerProfileId);
      if (!cancelled) {
        setListingsCount(listings.length);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewerProfileId]);

  const stub = (title: string) => () =>
    Alert.alert(title, 'This screen will be available in a future update.');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section title="MY ACTIVITY">
          <SettingsRow
            icon="cube-outline"
            label="My Listings"
            badge={String(listingsCount)}
            onPress={stub('My Listings')}
          />
          <SettingsRow
            icon="heart-outline"
            label="Saved Items"
            onPress={() => navigation.navigate('Favorites')}
          />
          <SettingsRow
            icon="star-outline"
            label="Reviews"
            onPress={stub('Reviews')}
            isLast
          />
        </Section>

        <Section title="SETTINGS">
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={stub('Notifications')}
          />
          <SettingsRow
            icon="shield-outline"
            label="Privacy & Safety"
            onPress={stub('Privacy & Safety')}
          />
          <SettingsRow
            icon="cog-outline"
            label="Account Settings"
            onPress={stub('Account Settings')}
            isLast
          />
        </Section>

        <Section title="SUPPORT">
          <SettingsRow
            icon="help-circle-outline"
            label="Help Center"
            onPress={stub('Help Center')}
            isLast
          />
        </Section>

        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
          onPress={() =>
            Alert.alert('Sign out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                  void signOut();
                },
              },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={22} color={signOutTint} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
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
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.header,
    fontSize: 17,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    backgroundColor: colors.surface,
  },
  rowWithSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.chipBg,
  },
  rowLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  chevron: {
    marginLeft: 'auto',
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  signOutPressed: {
    opacity: 0.65,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: signOutTint,
  },
});
