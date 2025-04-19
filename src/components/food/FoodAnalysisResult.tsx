
import { Card } from "@/components/ui/card";
import { MacronutrientChart } from "./MacronutrientChart";
import { Database, MapPin } from "lucide-react";

interface FoodAnalysisResultProps {
  isVisible: boolean;
  foodData: {
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence?: number;
    source?: 'local' | 'ai';
    region?: 'North Indian' | 'South Indian';
    macroPercentages?: {
      protein: number;
      carbs: number;
      fat: number;
    };
  } | null;
}

export const FoodAnalysisResult = ({ isVisible, foodData }: FoodAnalysisResultProps) => {
  if (!isVisible || !foodData) return null;

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{foodData.description}</h2>
            <div className="flex items-center gap-3 mt-1">
              {foodData.source && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {foodData.source === 'local' ? 'From Database' : 'AI Estimated'} 
                  {foodData.confidence && `(${Math.round(foodData.confidence * 100)}% confidence)`}
                </span>
              )}
              {foodData.region && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {foodData.region}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{foodData.calories}</span>
            <span className="text-muted-foreground text-sm ml-1">calories</span>
          </div>
        </div>

        <MacronutrientChart 
          protein={foodData.protein}
          carbs={foodData.carbs}
          fat={foodData.fat}
          calories={foodData.calories}
        />

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="text-lg font-bold">{foodData.protein}g</p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="text-lg font-bold">{foodData.carbs}g</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Fat</p>
            <p className="text-lg font-bold">{foodData.fat}g</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
