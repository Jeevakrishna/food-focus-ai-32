
// This dataset is populated from Foods_data.csv
export const foodDatabase = {
  "dosa": {
    calories: 133,
    protein: 3.5,
    carbs: 25.2,
    fat: 2.1,
    confidence: 1,
    region: "South Indian"
  },
  "idli": {
    calories: 85,
    protein: 2.5,
    carbs: 18.2,
    fat: 0.2,
    confidence: 1,
    region: "South Indian"
  },
  "sambar": {
    calories: 140,
    protein: 5,
    carbs: 23,
    fat: 4,
    confidence: 1,
    region: "South Indian"
  },
  "butter chicken": {
    calories: 485,
    protein: 28,
    carbs: 12,
    fat: 38,
    confidence: 1,
    region: "North Indian"
  },
  "naan": {
    calories: 260,
    protein: 9,
    carbs: 48,
    fat: 3.3,
    confidence: 1,
    region: "North Indian"
  },
  "biryani": {
    calories: 292,
    protein: 19,
    carbs: 25,
    fat: 14,
    confidence: 1,
    region: "North Indian"
  },
  "palak paneer": {
    calories: 260,
    protein: 11,
    carbs: 10,
    fat: 20,
    confidence: 1,
    region: "North Indian"
  },
  "masala dosa": {
    calories: 387,
    protein: 8,
    carbs: 52,
    fat: 18,
    confidence: 1,
    region: "South Indian"
  },
  "vada": {
    calories: 97,
    protein: 4.1,
    carbs: 18.2,
    fat: 0.9,
    confidence: 1,
    region: "South Indian"
  },
  "puri": {
    calories: 101,
    protein: 3,
    carbs: 14,
    fat: 4.2,
    confidence: 1,
    region: "North Indian"
  },
  "chapati": {
    calories: 120,
    protein: 4,
    carbs: 20,
    fat: 3.5,
    confidence: 1,
    region: "North Indian"
  }
};

export const findFoodInDataset = (foodName: string): null | {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  region?: string;
} => {
  const normalizedName = foodName.toLowerCase().trim();
  
  // Check for exact matches
  if (foodDatabase[normalizedName]) {
    return {
      ...foodDatabase[normalizedName],
      confidence: 1
    };
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return {
        ...value,
        confidence: 0.8 // Lower confidence for partial matches
      };
    }
  }

  return null;
};
