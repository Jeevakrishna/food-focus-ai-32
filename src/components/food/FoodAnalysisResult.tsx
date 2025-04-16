
import { Card } from "@/components/ui/card";
import { MacronutrientChart } from "./MacronutrientChart";
import { Database, BarChartBig, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    isUnhealthy?: boolean;
    macroPercentages?: {
      protein: number;
      carbs: number;
      fat: number;
    };
  } | null;
}

export const FoodAnalysisResult = ({ isVisible, foodData }: FoodAnalysisResultProps) => {
  if (!isVisible || !foodData) return null;

  const foodName = foodData.description.charAt(0).toUpperCase() + foodData.description.slice(1);

  return (
    <Card className="p-6 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{foodName}</h2>
              {foodData.source && (
                <Badge variant={foodData.isUnhealthy ? "destructive" : "secondary"} className="text-xs">
                  {foodData.isUnhealthy ? "Unhealthy" : "Identified"}
                  {foodData.confidence && ` (${Math.round(foodData.confidence * 100)}%)`}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {foodData.source === 'local' ? (
                <>
                  <Database className="w-3 h-3" />
                  From Nutrition Database
                </>
              ) : (
                <>
                  <BarChartBig className="w-3 h-3" />
                  AI Estimated
                </>
              )}
            </span>
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

        <div className="text-xs text-muted-foreground mt-2">
          <p className="flex items-center gap-1">
            <CircleCheck className="w-3 h-3" />
            Food data sourced from nutrition database
          </p>
        </div>
      </div>
    </Card>
  );
};
