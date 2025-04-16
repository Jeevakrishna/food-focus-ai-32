
import { useState, useEffect } from 'react';
import { Progress } from './ui/progress';

interface DailyProgressProps {
  calories: number;
}

const DailyProgress = ({ calories }: DailyProgressProps) => {
  const [progress, setProgress] = useState({
    calories: calories || 0,
    targetCalories: 2000 // Default target, you can make this customizable
  });

  // Update when calories prop changes
  useEffect(() => {
    setProgress(prev => ({
      ...prev,
      calories: calories
    }));
  }, [calories]);

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
