import { format } from "date-fns";

export interface FoodEntry {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  health_score?: number;
  health_description?: string;
  confidence?: number;
  source?: 'local' | 'ai';
}

const STORAGE_KEY = 'foodEntries';

export const saveFoodEntry = (entry: FoodEntry) => {
  const entries = getFoodEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getFoodEntries = (): FoodEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getTodayEntries = (): FoodEntry[] => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getFoodEntries().filter(entry => 
    entry.timestamp.startsWith(today)
  );
};

export const getDailyTotals = () => {
  const entries = getTodayEntries();
  return entries.reduce((totals, entry) => ({
    calories: totals.calories + entry.calories,
    protein: totals.protein + entry.protein,
    carbs: totals.carbs + entry.carbs,
    fat: totals.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

export const clearOldEntries = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const entries = getFoodEntries();
  const recentEntries = entries.filter(entry => 
    entry.timestamp.startsWith(today)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentEntries));
};