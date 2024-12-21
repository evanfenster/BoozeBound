import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

// Types
export interface Profile {
  sex: string;
  weight: string;
  height: string;
  weeklyLimit: string;
}

export interface Drink {
  id: string;
  type: string;
  volume: number;
  abv: number;
  timestamp: string;
}

// Storage Keys
const KEYS = {
  PROFILE: 'profile',
  DRINKS: 'drinks'
} as const;

// Profile Operations
export async function getProfile(): Promise<Profile> {
  const data = await AsyncStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : {
    sex: '',
    weight: '',
    height: '',
    weeklyLimit: '',
  };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

// Drinks Operations
export async function getDrinks(): Promise<Drink[]> {
  const data = await AsyncStorage.getItem(KEYS.DRINKS);
  return data ? JSON.parse(data) : [];
}

export async function saveDrinks(drinks: Drink[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.DRINKS, JSON.stringify(drinks));
}

export async function addDrink(drink: Omit<Drink, 'id'>): Promise<Drink> {
  const id = nanoid();
  const newDrink = { ...drink, id };
  const drinks = await getDrinks();
  drinks.push(newDrink);
  await saveDrinks(drinks);
  return newDrink;
}

export async function getDrinksByDate(date: string): Promise<Drink[]> {
  const drinks = await getDrinks();
  return drinks.filter(drink => drink.timestamp.startsWith(date));
}

export async function updateDrink(drink: Drink): Promise<void> {
  const drinks = await getDrinks();
  const index = drinks.findIndex(d => d.id === drink.id);
  if (index !== -1) {
    drinks[index] = drink;
    await saveDrinks(drinks);
  }
}

export async function deleteDrink(id: string): Promise<void> {
  const drinks = await getDrinks();
  const updatedDrinks = drinks.filter(drink => drink.id !== id);
  await saveDrinks(updatedDrinks);
}