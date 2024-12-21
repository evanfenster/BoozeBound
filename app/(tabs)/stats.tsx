import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Animated, Platform, UIManager } from 'react-native';
import { getDrinksByDate, calculateStandardDrinks } from '@/hooks/useDrinks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useProfile } from '@/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Calendar } from 'react-native-calendars';

dayjs.extend(relativeTime);

interface DailyData {
  date: string;
  total: number;
  displayDate: string;
}

interface Metrics {
  weeklyTotal: number;
  weeklyGoal: number;
  weeklyProgress: number;
  avgDrinksPerDay: number;
  dailyData: DailyData[];
  currentStreak: string;
  changeFromLastWeek: number;
  soberDays: number;
  heavyDrinkingDays: number;
  longestSoberStreak: number;
  daysUnderLimit: number;
  lastDrinkDay: string | null;
  consecutiveWeeksUnderLimit: number;
}

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
    text?: string;
    customContainerStyle?: any;
    drinks?: number;
  };
}

interface DrinkDetails {
  date: string;
  drinks: number;
  isVisible: boolean;
  position?: {
    x: number;
    y: number;
  };
}

export default function StatsScreen() {
  const { profile } = useProfile();
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    weeklyTotal: 0,
    weeklyGoal: Number(profile.weeklyLimit) || 14,
    weeklyProgress: 0,
    avgDrinksPerDay: 0,
    dailyData: [],
    currentStreak: '',
    changeFromLastWeek: 0,
    soberDays: 0,
    heavyDrinkingDays: 0,
    longestSoberStreak: 0,
    daysUnderLimit: 0,
    lastDrinkDay: null,
    consecutiveWeeksUnderLimit: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [drinkDetails, setDrinkDetails] = useState<DrinkDetails>({
    date: '',
    drinks: 0,
    isVisible: false,
    position: undefined,
  });
  const calendarRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedWeekOffset]);

  useEffect(() => {
    loadCalendarData(selectedMonth);
  }, [selectedMonth]);

  const loadData = async () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const startOfWeek = dayjs().add(selectedWeekOffset, 'week').startOf('week');
    const dailyData: DailyData[] = [];
    let weeklyTotal = 0;
    let lastWeekTotal = 0;
    let lastDrinkDay: string | null = null;
    let currentStreak = 0;
    let longestStreak = 0;
    let soberDays = 0;
    let heavyDrinkingDays = 0;
    let totalDrinks = 0;

    // Load last 30 days of data for overall stats
    const last30Days = [];
    for (let i = 0; i < 30; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const drinks = await getDrinksByDate(date);
      const dailyTotal = drinks.reduce((acc, drink) => acc + calculateStandardDrinks(drink.volume, drink.abv), 0);
      last30Days.push({ date, total: dailyTotal });
      
      if (dailyTotal === 0) {
        soberDays++;
      } else {
        if (!lastDrinkDay) lastDrinkDay = date;
      }

      if (dailyTotal > 4) heavyDrinkingDays++;
      totalDrinks += dailyTotal;
    }

    // Calculate current streak (consecutive sober days from today)
    currentStreak = 0;
    for (const day of last30Days) {
      if (day.total === 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let tempStreak = 0;
    longestStreak = 0;
    for (const day of last30Days) {
      if (day.total === 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Reset for weekly data
    weeklyTotal = 0;

    // Load current week data
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.add(i, 'day');
      const drinks = await getDrinksByDate(date.format('YYYY-MM-DD'));
      const dailyTotal = drinks.reduce((acc, drink) => acc + calculateStandardDrinks(drink.volume, drink.abv), 0);
      
      weeklyTotal += dailyTotal;

      dailyData.push({
        date: date.format('YYYY-MM-DD'),
        total: dailyTotal,
        displayDate: date.format('ddd'),
      });
    }

    // Load last week's data for comparison
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.subtract(1, 'week').add(i, 'day').format('YYYY-MM-DD');
      const drinks = await getDrinksByDate(date);
      lastWeekTotal += drinks.reduce((acc, drink) => acc + calculateStandardDrinks(drink.volume, drink.abv), 0);
    }

    const changeFromLastWeek = lastWeekTotal === 0 ? 0 : ((weeklyTotal - lastWeekTotal) / lastWeekTotal) * 100;
    const streakText = currentStreak > 0 
      ? `${currentStreak} day sober streak`
      : lastDrinkDay ? `Last drink ${dayjs(lastDrinkDay).fromNow()}` : 'No drinks recorded';

    // Calculate consecutive weeks under limit
    let consecutiveWeeks = 0;
    let currentWeek = dayjs();
    let stillUnderLimit = true;

    while (stillUnderLimit) {
      const startOfWeek = currentWeek.startOf('week');
      let weekTotal = 0;

      // Calculate total drinks for the week
      for (let i = 0; i < 7; i++) {
        const date = startOfWeek.add(i, 'day');
        // Don't count future days
        if (date.isAfter(dayjs())) continue;
        
        const drinks = await getDrinksByDate(date.format('YYYY-MM-DD'));
        weekTotal += drinks.reduce((acc, drink) => 
          acc + calculateStandardDrinks(drink.volume, drink.abv), 0
        );
      }

      if (weekTotal <= Number(profile.weeklyLimit)) {
        consecutiveWeeks++;
        currentWeek = currentWeek.subtract(1, 'week');
        // Stop if we're looking too far back (e.g., 52 weeks)
        if (consecutiveWeeks >= 52) break;
      } else {
        stillUnderLimit = false;
      }
    }

    setMetrics({
      weeklyTotal,
      weeklyGoal: Number(profile.weeklyLimit) || 14,
      weeklyProgress: (weeklyTotal / (Number(profile.weeklyLimit) || 14)) * 100,
      avgDrinksPerDay: weeklyTotal / 7,
      dailyData,
      currentStreak: streakText,
      changeFromLastWeek,
      soberDays,
      heavyDrinkingDays,
      longestSoberStreak: longestStreak,
      daysUnderLimit: Math.round(totalDrinks / 30 * 10) / 10, // Replace with 30-day average
      lastDrinkDay,
      consecutiveWeeksUnderLimit: consecutiveWeeks,
    });
  };

  const loadCalendarData = async (month: dayjs.Dayjs) => {
    const startOfMonth = month.startOf('month');
    const daysInMonth = month.daysInMonth();
    const newMarkedDates: MarkedDates = {};
    const today = dayjs();

    for (let i = 0; i < daysInMonth; i++) {
      const date = startOfMonth.add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      
      if (date.isAfter(today, 'day')) continue;

      const drinks = await getDrinksByDate(dateStr);
      const totalDrinks = drinks.reduce((acc, drink) => 
        acc + calculateStandardDrinks(drink.volume, drink.abv), 0
      );

      newMarkedDates[dateStr] = {
        customContainerStyle: {
          backgroundColor: getDrinkBackgroundColor(totalDrinks),
        },
        drinks: totalDrinks,
      };
    }
    setMarkedDates(newMarkedDates);
  };

  const getDrinkBackgroundColor = (drinks: number) => {
    const dailyLimit = (metrics.weeklyGoal / 7);
    
    if (drinks === 0) {
      return `hsla(142, 71%, 45%, 0.2)`; // Green for sober
    }
    if (drinks <= dailyLimit) {
      return `hsla(45, 100%, 51%, ${Math.min(0.7, drinks * 0.15)})`; // Yellow for within limit
    }
    return `hsla(348, 100%, 55%, ${Math.min(0.8, drinks * 0.15)})`; // Red for over limit
  };

  const handleDayPress = async (date: string, event: any) => {
    event.persist();
    const marking = markedDates[date];
    if (marking && calendarRef.current) {
      try {
        // Get calendar's layout information
        const layout = await new Promise<any>((resolve) => {
          calendarRef.current?.measureInWindow((x, y, width, height) => {
            resolve({ x, y, width, height });
          });
        });

        // Get the day's position within the calendar
        const dayWidth = 40; // Width of each day cell
        const dayHeight = 40; // Height of each day cell
        const dayNumber = parseInt(dayjs(date).format('D'), 10) - 1;
        const weekNumber = Math.floor(dayNumber / 7);
        
        // Calculate position relative to calendar
        const dayX = (dayNumber % 7) * dayWidth;
        const dayY = weekNumber * dayHeight + 50; // Add offset for header

        setDrinkDetails({
          date,
          drinks: marking.drinks || 0,
          isVisible: true,
          position: {
            x: layout.x + dayX,
            y: layout.y + dayY,
          },
        });
        
        setTimeout(() => {
          setDrinkDetails(prev => ({...prev, isVisible: false}));
        }, 2000);
      } catch (error) {
        console.log('Error calculating position:', error);
      }
    }
  };

  const renderBar = (day: DailyData, maxValue: number) => {
    const height = maxValue === 0 ? 30 : Math.max((day.total / maxValue) * 100, 30);
    const isToday = day.date === dayjs().format('YYYY-MM-DD');
    const withinLimit = day.total <= (metrics.weeklyGoal / 7);

    return (
      <View key={day.date} style={styles.barContainer}>
        <View style={styles.barWrapper}>
          <View 
            style={[
              styles.bar, 
              { height }, 
              isToday && styles.todayBar,
              !withinLimit && styles.overLimitBar,
              day.total === 0 && styles.emptyBar
            ]} 
          />
        </View>
        <Text style={[styles.barLabel, isToday && styles.todayText]}>{day.displayDate}</Text>
        <Text style={[styles.barValue, isToday && styles.todayText]}>
          {day.total > 0 ? day.total.toFixed(1) : ''}
        </Text>
      </View>
    );
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, icon?: string, color: string = '#4facfe') => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        {icon && (
          <View style={{
            backgroundColor: `${color}20`,
            padding: 6,
            borderRadius: 10,
          }}>
            <Ionicons name={icon as any} size={16} color={color} />
          </View>
        )}
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <Animated.ScrollView 
      style={[styles.container, { opacity: fadeAnim }]} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.text}
          colors={[Colors.dark.tint]}
          progressBackgroundColor="rgba(255,255,255,0.1)"
        />
      }
    >
      <Text style={styles.pageTitle}>Statistics</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.grid}>
          {renderMetricCard(
            'Sober Days',
            metrics.soberDays,
            'Last 30 days',
            'checkmark-circle-outline',
            Colors.semantic.recovery
          )}
          {renderMetricCard(
            'Heavy Drinking',
            metrics.heavyDrinkingDays,
            'Days over 4 drinks',
            'warning-outline',
            metrics.heavyDrinkingDays > 4 ? Colors.semantic.strain : Colors.semantic.recovery
          )}
        </View>

        <View style={styles.grid}>
          {renderMetricCard(
            '30-Day Average',
            metrics.daysUnderLimit,
            'drinks per day',
            'analytics-outline',
            metrics.daysUnderLimit > 2 ? Colors.semantic.strain : Colors.semantic.recovery
          )}
          {renderMetricCard(
            'Consecutive Weeks Under Limit',
            metrics.consecutiveWeeksUnderLimit === 52 ? '52+' : metrics.consecutiveWeeksUnderLimit,
            'weeks',
            'ribbon-outline',
            Colors.semantic.recovery
          )}
        </View>
      </View>

      <View style={[styles.card, styles.cardPrimary]}>
        <Text style={styles.chartTitle}>Weekly Overview</Text>
        <View style={styles.weekSelector}>
          <TouchableOpacity 
            onPress={() => setSelectedWeekOffset(prev => prev - 1)}
            style={styles.weekButton}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.weekText}>
            {dayjs().add(selectedWeekOffset, 'week').startOf('week').format('MMM D')} - {' '}
            {dayjs().add(selectedWeekOffset, 'week').endOf('week').format('MMM D')}
          </Text>
          <TouchableOpacity 
            onPress={() => setSelectedWeekOffset(prev => prev + 1)}
            style={styles.weekButton}
            disabled={selectedWeekOffset >= 0}
          >
            <Ionicons name="chevron-forward" size={20} color={selectedWeekOffset >= 0 ? '#666' : '#fff'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.avgText}>
          avg {metrics.avgDrinksPerDay.toFixed(1)} drinks/day
        </Text>

        <View style={styles.chartContainer}>
          {metrics.dailyData.map(day => 
            renderBar(day, Math.max(...metrics.dailyData.map(d => d.total), 1))
          )}
        </View>

        <View style={styles.weeklyProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(metrics.weeklyProgress, 100)}%`,
                  backgroundColor: metrics.weeklyProgress > 100 ? '#ff4444' : '#4facfe'
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {metrics.weeklyTotal.toFixed(1)} / {metrics.weeklyGoal} this week
          </Text>
        </View>

        {metrics.changeFromLastWeek !== 0 && (
          <View style={styles.changeContainer}>
            <Text style={[
              styles.changeText, 
              { color: metrics.changeFromLastWeek > 0 ? '#ff4444' : '#4facfe' }
            ]}>
              {metrics.changeFromLastWeek > 0 ? '▲' : '▼'} {Math.abs(metrics.changeFromLastWeek).toFixed(0)}% vs last week
            </Text>
          </View>
        )}
      </View>

      <View ref={calendarRef} style={[styles.card, styles.cardSecondary]}>
        <Calendar
          theme={{
            calendarBackground: 'transparent',
            monthTextColor: Colors.dark.text,
            dayTextColor: Colors.dark.text,
            textDisabledColor: Colors.dark.textTertiary,
            arrowColor: Colors.dark.tint,
            textDayFontWeight: '400',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '600',
            'stylesheet.calendar.header': {
              header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 12,
                alignItems: 'center',
              },
            },
            'stylesheet.day.basic': {
              base: {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              },
              text: {
                fontSize: 14,
                fontWeight: '400',
              },
            },
          }}
          markedDates={markedDates}
          markingType="custom"
          dayComponent={({date, state, marking}: {
            date?: {
              day: number;
              dateString: string;
            };
            state?: string;
            marking?: any;
          }) => (
            <TouchableOpacity 
              onPress={(event) => date && handleDayPress(date.dateString, event)}
              disabled={state === 'disabled'}
            >
              <View style={[
                styles.calendarDay,
                marking?.customContainerStyle,
              ]}>
                <Text style={[
                  styles.calendarDayText,
                  state === 'disabled' && { color: Colors.dark.textTertiary },
                ]}>
                  {date?.day}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          onMonthChange={(month: { dateString: string }) => {
            const requestedMonth = dayjs(month.dateString);
            if (requestedMonth.isAfter(dayjs(), 'month')) {
              return;
            }
            setSelectedMonth(requestedMonth);
          }}
          enableSwipeMonths={true}
          maxDate={dayjs().format('YYYY-MM-DD')}
        />

        {drinkDetails.isVisible && drinkDetails.position && (
          <View style={[
            styles.drinkDetailsPopup,
            {
              position: 'absolute',
              top: -60,
              left: 0,
              transform: [
                { translateX: drinkDetails.position.x - 55 },
                { translateY: drinkDetails.position.y }
              ],
            }
          ]}>
            <Text style={styles.drinkDetailsText}>
              {drinkDetails.drinks === 0 
                ? 'Sober day' 
                : `${drinkDetails.drinks.toFixed(1)} drinks`}
            </Text>
            <Text style={styles.drinkDetailsDate}>
              {dayjs(drinkDetails.date).format('MMM D, YYYY')}
            </Text>
          </View>
        )}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  pageTitle: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
    marginLeft: 4,
  },
  metricsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 12,
    borderLeftWidth: 3,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  metricTitle: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  metricSubtitle: {
    color: Colors.dark.textTertiary,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  avgText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 8,
    backgroundColor: Colors.dark.tint,
    borderRadius: 4,
  },
  emptyBar: {
    backgroundColor: Colors.dark.border,
    opacity: 0.5,
  },
  todayBar: {
    backgroundColor: Colors.semantic.focus,
    width: 10,
  },
  overLimitBar: {
    backgroundColor: Colors.semantic.strain,
  },
  barLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  barValue: {
    color: Colors.dark.text,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  calendarDay: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 2,
  },
  calendarDayText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  drinkDetailsPopup: {
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: 12,
    borderRadius: 16,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1000,
  },
  drinkDetailsText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  drinkDetailsDate: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  todayText: {
    color: Colors.semantic.focus,
  },
  changeContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardPrimary: {
    backgroundColor: Colors.dark.card,
  },
  cardSecondary: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  weeklyProgress: {
    marginBottom: 15,
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
  },
  weekButton: {
    padding: 6,
    borderRadius: 8,
  },
  weekText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
});
