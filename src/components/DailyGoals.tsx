import React, { useState } from 'react';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DailyGoals {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFats: number;
}

const DailyGoals: React.FC = () => {
  const [goals, setGoals] = useState<DailyGoals>({
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 250,
    targetFats: 65,
    consumedCalories: 0,
    consumedProtein: 0,
    consumedCarbs: 0,
    consumedFats: 0
  });

  const updateDailyGoals = (foodItem: FoodItem) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      consumedCalories: prevGoals.consumedCalories + foodItem.calories,
      consumedProtein: prevGoals.consumedProtein + foodItem.protein,
      consumedCarbs: prevGoals.consumedCarbs + foodItem.carbs,
      consumedFats: prevGoals.consumedFats + foodItem.fats
    }));
  };

  return (
    <div className="daily-goals">
      <h2>Daily Goals Progress</h2>
      <div className="goals-progress">
        <div className="goal-item">
          <label>Calories</label>
          <progress 
            value={goals.consumedCalories} 
            max={goals.targetCalories}
          />
          <span>{goals.consumedCalories} / {goals.targetCalories} kcal</span>
        </div>
        {/* Similar progress bars for protein, carbs, and fats */}
      </div>
    </div>
  );
};

export default DailyGoals; 