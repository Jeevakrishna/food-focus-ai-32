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
const CALENDAR_PROGRESS_KEY = 'calorieProgress';

export const saveFoodEntry = (entry: FoodEntry) => {
  const entries = getFoodEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  
  // Update calendar progress
  const goals = JSON.parse(localStorage.getItem('macroGoals') || '{"calories": 2000}');
  const todayTotals = getDailyTotals();
  const achieved = todayTotals.calories >= goals.calories;
  
  updateCalendarProgress(achieved);
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

export const updateCalendarProgress = (achieved: boolean) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const stored = localStorage.getItem(CALENDAR_PROGRESS_KEY);
  const progress = stored ? JSON.parse(stored) : [];
  
  const existingIndex = progress.findIndex((p: any) => p.date === today);
  if (existingIndex >= 0) {
    progress[existingIndex].achieved = achieved;
  } else {
    progress.push({
      date: today,
      achieved,
      calories: getDailyTotals().calories
    });
  }
  
  localStorage.setItem(CALENDAR_PROGRESS_KEY, JSON.stringify(progress));
};

export const exportFoodData = () => {
  const entries = getFoodEntries();
  const csvContent = [
    ['Date', 'Time', 'Description', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
    ...entries.map(entry => [
      format(new Date(entry.timestamp), 'yyyy-MM-dd'),
      format(new Date(entry.timestamp), 'HH:mm'),
      entry.description,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `food-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};