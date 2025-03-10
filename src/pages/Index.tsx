
import { FoodEntryList } from "@/components/food/FoodEntryList";
import { FoodInsights } from "@/components/food/FoodInsights";
import { FoodFacts } from "@/components/food/FoodFacts";
import { DailyProgress } from "@/components/food/DailyProgress";
import { FoodTracking } from "@/components/food/FoodTracking";
import { TimeDisplay } from "@/components/food/TimeDisplay";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { getTodayEntries, getDailyTotals } from "@/utils/foodEntryManager";
import { useState, useEffect } from "react";

const Index = () => {
  const { entries, setEntries } = useFoodEntries();
  const goals = useNutritionGoals();
  const [totals, setTotals] = useState(getDailyTotals());

  // Update totals whenever entries change
  useEffect(() => {
    updateTotals();
  }, [entries]);

  const updateTotals = () => {
    setTotals(getDailyTotals());
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <TimeDisplay />
        </div>

        <div className="grid gap-6">
          <DailyProgress
            currentCalories={totals.calories}
            goalCalories={goals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
            proteinGoal={goals.protein}
            carbsGoal={goals.carbs}
            fatGoal={goals.fat}
          />

          <FoodTracking 
            goals={goals} 
            setEntries={setEntries} 
            updateTotals={updateTotals} 
          />

          <FoodEntryList entries={getTodayEntries()} title="Today's Entries" />
          
          <div className="mt-4">
            <FoodFacts entries={entries} />
          </div>
          <div className="mt-4">
            <FoodInsights entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
