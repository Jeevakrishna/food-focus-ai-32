import React, { useState } from 'react';
import { useToast } from './ui/use-toast';

interface FoodData {
  name: string;
  calories: number;
}

interface FoodUploadProps {
  onFoodAdd: (calories: number) => void;
}

const FoodUpload = ({ onFoodAdd }: FoodUploadProps) => {
  const [foodData, setFoodData] = useState<FoodData>({
    name: '',
    calories: 0
  });
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update the daily progress with new calories
      onFoodAdd(foodData.calories);
      
      // Show success message
      toast({
        title: "Food added successfully",
        description: `Added ${foodData.name} (${foodData.calories} kcal)`,
      });
      
      // Reset form
      setFoodData({
        name: '',
        calories: 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="foodName" className="block text-sm font-medium">
          Food Name
        </label>
        <input
          id="foodName"
          type="text"
          value={foodData.name}
          onChange={(e) => setFoodData({ ...foodData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>
      
      <div>
        <label htmlFor="calories" className="block text-sm font-medium">
          Calories
        </label>
        <input
          id="calories"
          type="number"
          value={foodData.calories}
          onChange={(e) => setFoodData({ ...foodData, calories: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border p-2"
          required
          min="0"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white rounded-md py-2 hover:bg-primary/90"
      >
        Add Food
      </button>
    </form>
  );
};

export default FoodUpload; 