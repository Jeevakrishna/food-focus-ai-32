// This is a simplified version of the dataset for demonstration
// In a production environment, this would be loaded from an external source
export const foodDatabase = {
  "pizza": {
    calories: 266,
    protein: 11,
    carbs: 33,
    fat: 10,
    confidence: 1
  },
  "burger": {
    calories: 354,
    protein: 20,
    carbs: 29,
    fat: 17,
    confidence: 1
  },
  "salad": {
    calories: 100,
    protein: 3,
    carbs: 11,
    fat: 7,
    confidence: 1
  },
  // Add more food items as needed
};

export const findFoodInDataset = (foodName: string): null | {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
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