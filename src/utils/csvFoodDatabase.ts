/**
 * Utility for parsing and searching food data from a CSV file
 */

// This is a simplified version of the food database
// In production, we would load this from the CSV file
export interface FoodItem {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: any; // Allow for additional properties
}

// Sample dataset (would normally be loaded from CSV)
export const foodDatabase: FoodItem[] = [
  { food_name: "apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { food_name: "banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { food_name: "orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { food_name: "chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { food_name: "salmon", calories: 206, protein: 22, carbs: 0, fat: 13 },
  { food_name: "rice", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { food_name: "pasta", calories: 158, protein: 6, carbs: 31, fat: 1 },
  { food_name: "bread", calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  { food_name: "yogurt", calories: 59, protein: 3.5, carbs: 5, fat: 3.3 },
  { food_name: "eggs", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { food_name: "beef", calories: 250, protein: 26, carbs: 0, fat: 17 },
  { food_name: "potato", calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { food_name: "broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { food_name: "spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { food_name: "avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  { food_name: "cheese", calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  { food_name: "milk", calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  { food_name: "burger", calories: 354, protein: 20, carbs: 29, fat: 17 },
  { food_name: "pizza", calories: 266, protein: 11, carbs: 33, fat: 10 },
  { food_name: "salad", calories: 100, protein: 3, carbs: 11, fat: 7 },
  { food_name: "fried rice", calories: 168, protein: 3.5, carbs: 27, fat: 5.4 },
  { food_name: "sushi", calories: 200, protein: 7, carbs: 38, fat: 3 },
  // Special case for chips - keeping this for the specific detection
  { food_name: "chips", calories: 535, protein: 6.8, carbs: 56, fat: 32, isUnhealthy: true }
];

/**
 * Search for a food item in the database by name
 */
export const findFoodInDatabase = (foodName: string): FoodItem | null => {
  if (!foodName) return null;
  
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check for exact matches first
  const exactMatch = foodDatabase.find(
    item => item.food_name.toLowerCase() === normalizedName
  );
  if (exactMatch) return exactMatch;
  
  // Then check for partial matches
  const partialMatch = foodDatabase.find(
    item => normalizedName.includes(item.food_name) || 
            item.food_name.includes(normalizedName)
  );
  
  return partialMatch || null;
};

/**
 * Calculate the macronutrient percentages for a food item
 */
export const calculateMacroPercentages = (
  food: FoodItem
): { protein: number; carbs: number; fat: number } => {
  const proteinCalories = food.protein * 4;
  const carbCalories = food.carbs * 4;
  const fatCalories = food.fat * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories;
  
  return {
    protein: Math.round((proteinCalories / totalCalories) * 100) || 0,
    carbs: Math.round((carbCalories / totalCalories) * 100) || 0,
    fat: Math.round((fatCalories / totalCalories) * 100) || 0
  };
};
