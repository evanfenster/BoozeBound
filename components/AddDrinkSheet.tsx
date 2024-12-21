import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DRINK_TYPES } from '../constants/drinkTypes';
import { Drink } from '../hooks/useDrinks';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AddDrinkSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd?: (type: string, volume: number, abv: number, time: Date) => void;
  onEdit?: (volume: number, abv: number, time: Date) => void;
  initialDrinkType: string;
  editingDrink?: Drink | null;
  selectedDate: Date;
}

export function AddDrinkSheet({ 
  isVisible, 
  onClose, 
  onAdd, 
  onEdit,
  initialDrinkType,
  editingDrink,
  selectedDate
}: AddDrinkSheetProps) {
  const selectedDrinkType = DRINK_TYPES.find(t => t.id === (editingDrink?.type || initialDrinkType)) || DRINK_TYPES[0];
  
  const [volume, setVolume] = useState(selectedDrinkType.defaultVolume);
  const [abv, setAbv] = useState(editingDrink?.abv || selectedDrinkType.abv);
  const [selectedTime] = useState(editingDrink ? new Date(editingDrink.timestamp) : new Date(selectedDate));
  
  useEffect(() => {
    if (editingDrink) {
      setVolume(editingDrink.volume);
      setAbv(editingDrink.abv);
    } else if (selectedDrinkType) {
      setVolume(selectedDrinkType.defaultVolume);
      setAbv(selectedDrinkType.abv);
    }
  }, [editingDrink, initialDrinkType]);

  const handleSubmit = () => {
    if (editingDrink && onEdit) {
      onEdit(volume, abv, selectedTime);
    } else if (onAdd && selectedDrinkType) {
      onAdd(selectedDrinkType.id, volume, abv, selectedTime);
    }
    onClose();
  };

  const volumeOptions = Array.from(
    { length: Math.floor((selectedDrinkType.maxVolume - selectedDrinkType.minVolume) / selectedDrinkType.volumeStep) + 1 },
    (_, i) => selectedDrinkType.minVolume + i * selectedDrinkType.volumeStep
  );

  // ABV options from 3% to 43%
  const abvOptions = Array.from(
    { length: 41 },
    (_, i) => (i + 3) / 100
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingDrink ? 'Edit Drink' : `Add ${selectedDrinkType.name}`}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Volume</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsContainer}
              >
                {volumeOptions.map((vol) => (
                  <TouchableOpacity
                    key={vol}
                    style={[
                      styles.optionButton,
                      volume === vol && styles.optionButtonActive
                    ]}
                    onPress={() => setVolume(vol)}
                  >
                    <Text style={[
                      styles.optionText,
                      volume === vol && styles.optionTextActive
                    ]}>
                      {vol}oz
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ABV</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsContainer}
              >
                {abvOptions.map((decimal) => (
                  <TouchableOpacity
                    key={decimal}
                    style={[
                      styles.optionButton,
                      abv === decimal && styles.optionButtonActive
                    ]}
                    onPress={() => setAbv(decimal)}
                  >
                    <Text style={[
                      styles.optionText,
                      abv === decimal && styles.optionTextActive
                    ]}>
                      {(decimal * 100).toFixed(0)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <Text style={styles.addButtonText}>
                {editingDrink ? 'Save Changes' : `Add ${selectedDrinkType.name}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#25292e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.6,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  optionButtonActive: {
    backgroundColor: '#ffa500',
  },
  optionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#ffa500',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 