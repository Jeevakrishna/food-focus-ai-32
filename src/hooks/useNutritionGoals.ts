
import { useState } from "react";

export const useNutritionGoals = () => {
  const [goals] = useState(() => {
    const saved = localStorage.getItem("macroGoals");
    return saved ? JSON.parse(saved) : {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70
    };
  });

  return goals;
};
