import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type ListingItem } from '@/data/mockData';
import { navigateToItemDetail } from '@/navigation/navigateItemDetail';
import type { RootStackNav } from '@/navigation/types';
import { fetchEventListings } from '@/services/events';
import { colors, fonts, spacing } from '@/styles/theme';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const DAY_PATTERN = [2, 4, 7, 10, 12, 15, 18, 21, 23, 24, 25, 29] as const;
const HOUR_PATTERN = [18, 20, 11, 17, 19, 14, 21, 16] as const;

type CalendarEvent = ListingItem & {
  startsAt: Date;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function shortDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function timeLabel(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampDay(date: Date, day: number) {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.min(day, daysInMonth);
}

function buildCalendarEvents(items: ListingItem[], baseMonth: Date): CalendarEvent[] {
  const today = new Date();
  const sameAsCurrentMonth =
    today.getFullYear() === baseMonth.getFullYear() &&
    today.getMonth() === baseMonth.getMonth();
  const currentDay = clampDay(baseMonth, today.getDate());
  const nextDay = clampDay(baseMonth, Math.min(today.getDate() + 1, 31));
  const prioritizedDays = sameAsCurrentMonth ? [currentDay, nextDay] : [];
  const orderedDays = [...prioritizedDays, ...DAY_PATTERN];

  return items.map((item, index) => {
    const day = clampDay(baseMonth, orderedDays[index % orderedDays.length]);
    const hour = HOUR_PATTERN[index % HOUR_PATTERN.length];
    const minute = index % 2 === 0 ? 0 : 30;
    return {
      ...item,
      startsAt: new Date(
        baseMonth.getFullYear(),
        baseMonth.getMonth(),
        day,
        hour,
        minute,
      ),
    };
  });
}

function EventRow({
  event,
  navigation,
}: {
  event: CalendarEvent;
  navigation: RootStackNav;
}) {
  return (
    <Pressable
      onPress={() =>
        navigateToItemDetail(navigation, {
          listingId: event.id,
          title: event.title,
          price: event.price,
          imageUrl: event.imageUrl,
          seller: event.sellerHandle ?? 'Campus host',
          sellerProfileId: event.sellerId,
          sellerAvatarUrl: event.sellerAvatarUrl,
          categoryLabel: 'Events',
          condition: event.condition,
          description: event.description,
          meetupLocation: event.location,
        })
      }
      style={styles.eventRow}
    >
      <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />

      <View style={styles.eventBody}>
        <Text style={styles.eventTime}>{timeLabel(event.startsAt)}</Text>
        <Text numberOfLines={1} style={styles.eventTitle}>
          {event.title}
        </Text>
        <Text numberOfLines={1} style={styles.eventLocation}>
          {event.location ?? 'Campus venue'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function EventsCalendarScreen() {
  const navigation = useNavigation<RootStackNav>();
  const [refreshing, setRefreshing] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<ListingItem[]>([]);

  const loadEvents = useCallback(async () => {
    const next = await fetchEventListings();
    setEvents(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadEvents();
    } finally {
      setRefreshing(false);
    }
  }, [loadEvents]);

  const calendarEvents = useMemo(
    () => buildCalendarEvents(events, displayMonth),
    [displayMonth, events],
  );

  const eventDays = useMemo(
    () => new Set(calendarEvents.map((event) => event.startsAt.getDate())),
    [calendarEvents],
  );
  const todayEvents = useMemo(() => {
    const today = startOfDay(new Date());
    return calendarEvents.filter((event) => isSameDay(event.startsAt, today));
  }, [calendarEvents]);
  const weekEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return calendarEvents.filter((event) => {
      const eventDay = startOfDay(event.startsAt);
      return eventDay > today && eventDay <= weekEnd;
    });
  }, [calendarEvents]);

  const monthStart = startOfMonth(displayMonth);
  const firstWeekday = monthStart.getDay();
  const totalDays = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from({ length: firstWeekday + totalDays }, (_, index) => {
    if (index < firstWeekday) return null;
    return index - firstWeekday + 1;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable
              hitSlop={10}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
            </Pressable>

            <View>
            <Text style={styles.headerTitle}>Events</Text>
            <Text style={styles.headerSubtitle}>See what&apos;s happening on campus.</Text>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Pressable
              hitSlop={8}
              onPress={() => {
                const next = new Date(displayMonth);
                next.setMonth(displayMonth.getMonth() - 1);
                const normalized = startOfMonth(next);
                setDisplayMonth(normalized);
                setSelectedDate(
                  new Date(
                    normalized.getFullYear(),
                    normalized.getMonth(),
                    clampDay(normalized, selectedDate.getDate()),
                  ),
                );
              }}
              style={styles.monthArrow}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>

            <View style={styles.monthLabelWrap}>
              <Text style={styles.monthLabel}>{monthLabel(displayMonth)}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </View>

            <Pressable
              hitSlop={8}
              onPress={() => {
                const next = new Date(displayMonth);
                next.setMonth(displayMonth.getMonth() + 1);
                const normalized = startOfMonth(next);
                setDisplayMonth(normalized);
                setSelectedDate(
                  new Date(
                    normalized.getFullYear(),
                    normalized.getMonth(),
                    clampDay(normalized, selectedDate.getDate()),
                  ),
                );
              }}
              style={styles.monthArrow}
            >
              <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {cells.map((day, index) => {
              if (day == null) {
                return <View key={`blank-${index}`} style={styles.dayCell} />;
              }

              const thisDate = new Date(
                displayMonth.getFullYear(),
                displayMonth.getMonth(),
                day,
              );
              const selected = isSameDay(thisDate, selectedDate);
              const dotted = eventDays.has(day);

              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDate(thisDate)}
                  style={styles.dayCell}
                >
                  <View style={[styles.dayNumberWrap, selected && styles.dayNumberWrapSelected]}>
                    <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                      {day}
                    </Text>
                  </View>
                  {dotted ? <View style={styles.dayDot} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionMeta}>{shortDateLabel(new Date())}</Text>
        </View>

        {todayEvents.length > 0 ? (
          todayEvents.map((event) => (
            <EventRow key={event.id} event={event} navigation={navigation} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No events today</Text>
            <Text style={styles.emptyBody}>Check back later for new campus plans.</Text>
          </View>
        )}

        <View style={styles.sectionHeaderWeek}>
          <Text style={styles.sectionTitle}>This Week</Text>
        </View>

        {weekEvents.length > 0 ? (
          weekEvents.map((event) => (
            <EventRow key={`week-${event.id}`} event={event} navigation={navigation} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No more events this week</Text>
            <Text style={styles.emptyBody}>Upcoming campus events will show up here.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() =>
            navigation.navigate('Main', {
              screen: 'CreateListing',
              params: { screen: 'CreateEntry' },
            })
          }
          style={({ pressed }) => [styles.bottomButton, pressed && styles.bottomButtonPressed]}
        >
          <Ionicons name="add" size={24} color={colors.surface} />
          <Text style={styles.bottomButtonText}>Create Event</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.extraBold,
    fontSize: 22,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  calendarCard: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionHeaderWeek: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: -0.3,
  },
  sectionMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  weekRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 2,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWrapSelected: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  dayNumberSelected: {
    color: colors.surface,
    fontFamily: fonts.bold,
  },
  dayDot: {
    marginTop: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 7,
    marginBottom: 7,
  },
  eventImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.chipBg,
  },
  eventBody: {
    flex: 1,
    marginLeft: 8,
    marginRight: 6,
  },
  eventTime: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  eventTitle: {
    marginTop: 1,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  eventLocation: {
    marginTop: 1,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  emptyState: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  emptyBody: {
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 24,
    backgroundColor: 'rgba(249,250,251,0.96)',
  },
  bottomButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bottomButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  bottomButtonText: {
    color: colors.surface,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
