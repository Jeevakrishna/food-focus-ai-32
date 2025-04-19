
interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  region: string;
}

// Food database with nutritional information from Foods_data.csv
export const nutritionDatabase: Record<string, NutritionInfo> = {
  "dosa": { calories: 133, protein: 3.5, carbs: 25.2, fat: 2.1, region: "South Indian" },
  "idli": { calories: 85, protein: 2.5, carbs: 18.2, fat: 0.2, region: "South Indian" },
  "sambar": { calories: 140, protein: 5, carbs: 23, fat: 4, region: "South Indian" },
  "butter chicken": { calories: 485, protein: 28, carbs: 12, fat: 38, region: "North Indian" },
  "naan": { calories: 260, protein: 9, carbs: 48, fat: 3.3, region: "North Indian" },
  "biryani": { calories: 292, protein: 19, carbs: 25, fat: 14, region: "North Indian" },
  "palak paneer": { calories: 260, protein: 11, carbs: 10, fat: 20, region: "North Indian" },
  "masala dosa": { calories: 387, protein: 8, carbs: 52, fat: 18, region: "South Indian" },
  "vada": { calories: 97, protein: 4.1, carbs: 18.2, fat: 0.9, region: "South Indian" },
  "puri": { calories: 101, protein: 3, carbs: 14, fat: 4.2, region: "North Indian" },
  "chapati": { calories: 120, protein: 4, carbs: 20, fat: 3.5, region: "North Indian" }
};

export interface FoodMatch extends NutritionInfo {
  confidence: number;
  source: 'local';
}

export const findInLocalDatabase = (foodName: string): FoodMatch | null => {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check exact matches first
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName === key) {
      return { ...value, confidence: 1, source: 'local' };
    }
  }
  
  // Then check partial matches
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return { ...value, confidence: 0.8, source: 'local' };
    }
  }
  
  return null;
}
