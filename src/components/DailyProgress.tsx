import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';

interface DailyProgress {
  calories: number;
  targetCalories: number;
}

const DailyProgress = () => {
  const [progress, setProgress] = useState<DailyProgress>({
    calories: 0,
    targetCalories: 2000 // Default target, you can make this customizable
  });

  // Function to update calories
  const updateCalories = (newCalories: number) => {
    setProgress(prev => ({
      ...prev,
      calories: prev.calories + newCalories
    }));
  };

  // Calculate percentage for progress bar
  const caloriePercentage = (progress.calories / progress.targetCalories) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daily Progress</h3>
        <span className="text-sm text-gray-500">
          {progress.calories} / {progress.targetCalories} kcal
        </span>
      </div>
      <Progress value={caloriePercentage} className="h-2" />
    </div>
  );
};

export default DailyProgress; 