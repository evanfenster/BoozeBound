import {
  Drink,
  addDrink as dbAddDrink,
  getDrinksByDate as dbGetDrinksByDate,
  deleteDrink as dbDeleteDrink,
  updateDrink as dbUpdateDrink,
} from '../db/storage';
import { calculateStandardDrinks as dbCalculateStandardDrinks} from '../utils/calculations';
export type { Drink };

export const addDrink = dbAddDrink;
export const getDrinksByDate = dbGetDrinksByDate;
export const deleteDrink = dbDeleteDrink;
export const updateDrink = dbUpdateDrink;
export const calculateStandardDrinks = dbCalculateStandardDrinks;
 