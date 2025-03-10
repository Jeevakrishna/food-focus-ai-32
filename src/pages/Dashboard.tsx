import { useState } from 'react';
import DailyProgress from '../components/DailyProgress';
import FoodUpload from '../components/FoodUpload';

const Dashboard = () => {
  const [totalCalories, setTotalCalories] = useState(0);

  const handleFoodAdd = (calories: number) => {
    setTotalCalories(prev => prev + calories);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <DailyProgress calories={totalCalories} />
      <FoodUpload onFoodAdd={handleFoodAdd} />
    </div>
  );
};

export default Dashboard; 