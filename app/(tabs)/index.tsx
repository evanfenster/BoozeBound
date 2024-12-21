import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getDrinksByDate, addDrink, Drink, calculateStandardDrinks, deleteDrink, updateDrink } from '@/hooks/useDrinks';
import { useProfile } from '@/hooks/useProfile';
import { DrinkVisualization } from '@/components/DrinkVisualization';
import { AddDrinkSheet } from '@/components/AddDrinkSheet';
import { Ionicons } from '@expo/vector-icons';
import { DRINK_TYPES } from '@/constants/drinkTypes';
import dayjs from 'dayjs';
import { Colors } from '@/constants/Colors';

export default function TabOneScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isAddDrinkVisible, setIsAddDrinkVisible] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState('');
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { profile } = useProfile();

  useEffect(() => {
    loadDrinks();
  }, [selectedDate]);

  const loadDrinks = async () => {
    const loadedDrinks = await getDrinksByDate(selectedDate.format('YYYY-MM-DD'));
    setDrinks(loadedDrinks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handleAddDrink = async (type: string, volume: number, abv: number, time: Date) => {
    const drinkDate = new Date(selectedDate.year(), selectedDate.month(), selectedDate.date(),
      time.getHours(), time.getMinutes());

    await addDrink({
      type,
      volume,
      abv,
      timestamp: drinkDate.toISOString()
    });
    setIsAddDrinkVisible(false);
    loadDrinks();
  };

  const handleEditDrink = async (volume: number, abv: number, time: Date) => {
    if (!editingDrink) return;
    
    const drinkDate = new Date(selectedDate.year(), selectedDate.month(), selectedDate.date(),
      time.getHours(), time.getMinutes());
    
    await updateDrink({
      ...editingDrink,
      volume,
      abv,
      timestamp: drinkDate.toISOString()
    });
    setEditingDrink(null);
    setIsAddDrinkVisible(false);
    loadDrinks();
  };

  const handleDeleteDrink = async (drink: Drink) => {
    await deleteDrink(drink.id);
    loadDrinks();
  };

  const weeklyLimit = Number(profile.weeklyLimit) || 14;
  
  const getWeeklyDrinks = async () => {
    const startOfWeek = selectedDate.startOf('week');
    const weekDrinks = [];
    for (let i = 0; i < 7; i++) {
      const dayDrinks = await getDrinksByDate(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
      weekDrinks.push(...dayDrinks);
    }
    return weekDrinks.reduce((acc, drink) => acc + calculateStandardDrinks(drink.volume, drink.abv), 0);
  };

  const [weeklyDrinks, setWeeklyDrinks] = useState(0);

  useEffect(() => {
    getWeeklyDrinks().then(setWeeklyDrinks);
  }, [selectedDate, drinks]);

  const handleDrinkTypeSelect = (type: string) => {
    setSelectedDrinkType(type);
    setEditingDrink(null);
    setIsAddDrinkVisible(true);
  };

  const handleDrinkPress = (drink: Drink) => {
    setEditingDrink(drink);
    setIsAddDrinkVisible(true);
  };

  const renderDrinksList = () => (
    <View style={styles.drinksList}>
      {drinks.map((drink, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.drinkItem}
          onPress={() => handleDrinkPress(drink)}
        >
          <View style={styles.drinkInfo}>
            <Text style={styles.drinkName}>{DRINK_TYPES.find(t => t.id === drink.type)?.name}</Text>
            <Text style={styles.drinkDetails}>
              {drink.volume}oz • {(drink.abv * 100).toFixed(0)}% ABV • {calculateStandardDrinks(drink.volume, drink.abv).toFixed(1)} std
            </Text>
            <Text style={styles.drinkTime}>{dayjs(drink.timestamp).format('h:mm A')}</Text>
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteDrink(drink);
            }} 
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const DateSelector = () => (
    <View style={styles.dateSelector}>
      <TouchableOpacity onPress={() => setSelectedDate(prev => prev.subtract(1, 'day'))}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.dateText}>
        {selectedDate.format('MMM D, YYYY')}
      </Text>
      <TouchableOpacity onPress={() => setSelectedDate(prev => prev.add(1, 'day'))}>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <DateSelector />
        
        <View style={styles.mainVisualizationContainer}>
          <View style={styles.visualizationContainer}>
            <DrinkVisualization 
              weeklyDrinks={weeklyDrinks}
              weeklyLimit={weeklyLimit}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statsLabel}>Drinks Today</Text>
              <View style={[
                styles.dailyContainer,
                { backgroundColor: getProgressBackground(weeklyDrinks / weeklyLimit) }
              ]}>
                <Text style={styles.dailyNumber}>
                  {drinks.reduce((acc, drink) => acc + calculateStandardDrinks(drink.volume, drink.abv), 0).toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statsLabel}>Weekly Remaining</Text>
              <View style={styles.circularProgressContainer}>
                <View style={[
                  styles.circularProgress,
                  { 
                    backgroundColor: getProgressBackground(weeklyDrinks / weeklyLimit),
                    borderColor: getProgressColor(weeklyDrinks / weeklyLimit),
                  }
                ]}>
                  <Text style={styles.statsNumber}>{(weeklyLimit - weeklyDrinks).toFixed(1)}</Text>
                  <Text style={styles.statsUnit}>/ {weeklyLimit}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.drinkTypesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.drinkTypesContent}
          >
            {DRINK_TYPES.map((drinkType) => (
              <TouchableOpacity
                key={drinkType.id}
                style={styles.drinkTypeButton}
                onPress={() => handleDrinkTypeSelect(drinkType.id)}
              >
                <View style={styles.drinkTypeIcon}>
                  <Ionicons name={getDrinkIcon(drinkType.id)} size={24} color="#fff" />
                </View>
                <Text style={styles.drinkTypeText}>{drinkType.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {drinks.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Today's Drinks</Text>
            {renderDrinksList()}
          </View>
        )}
      </ScrollView>

      <AddDrinkSheet
        isVisible={isAddDrinkVisible}
        onClose={() => {
          setIsAddDrinkVisible(false);
          setSelectedDrinkType('');
          setEditingDrink(null);
        }}
        onAdd={handleAddDrink}
        onEdit={handleEditDrink}
        initialDrinkType={selectedDrinkType}
        editingDrink={editingDrink}
        selectedDate={selectedDate.toDate()}
      />
    </View>
  );
}

function getDrinkIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'beer':
      return 'beer-outline';
    case 'wine':
      return 'wine-outline';
    case 'cocktail':
      return 'cafe-outline';
    case 'shot':
      return 'flash-outline';
    default:
      return 'water-outline';
  }
}

function getProgressColor(ratio: number): string {
  if (ratio >= 1) return '#ff4444';  // Red when at or over limit
  if (ratio >= 0.75) return '#ff8800';  // Orange when getting close
  if (ratio >= 0.5) return '#ffcc00';   // Yellow at halfway
  return '#44dd88';  // Green when plenty remaining
}

function getProgressBackground(ratio: number): string {
  if (ratio >= 1) return 'rgba(255,68,68,0.15)';  // Red
  if (ratio >= 0.75) return 'rgba(255,136,0,0.15)';  // Orange
  if (ratio >= 0.5) return 'rgba(255,204,0,0.15)';   // Yellow
  return 'rgba(68,221,136,0.15)';  // Green
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 20,
  },
  dateText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
  },
  mainVisualizationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  visualizationContainer: {
    flex: 1,
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    gap: 20,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  circularProgressContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  circularProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  statsUnit: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  dailyContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  historyContainer: {
    padding: 20,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  drinksList: {
    gap: 10,
  },
  drinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
  },
  drinkInfo: {
    flex: 1,
  },
  drinkName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
  },
  drinkDetails: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  drinkTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  drinkTypesContainer: {
    paddingVertical: 10,
  },
  drinkTypesContent: {
    paddingHorizontal: 20,
    gap: 30,
    flexDirection: 'row',
  },
  drinkTypeButton: {
    alignItems: 'center',
    gap: 8,
  },
  drinkTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkTypeText: {
    color: '#fff',
    fontSize: 12,
  },
});
