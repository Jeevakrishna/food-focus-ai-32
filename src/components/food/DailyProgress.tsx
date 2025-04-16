
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Utensils } from "lucide-react";

interface DailyProgressProps {
  currentCalories: number;
  goalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export const DailyProgress = ({
  currentCalories,
  goalCalories,
  protein,
  carbs,
  fat,
  proteinGoal,
  carbsGoal,
  fatGoal
}: DailyProgressProps) => {
  // Calculate percentages for progress bars
  const caloriePercentage = Math.min(100, (currentCalories / goalCalories) * 100);
  const proteinPercentage = Math.min(100, (protein / proteinGoal) * 100);
  const carbsPercentage = Math.min(100, (carbs / carbsGoal) * 100);
  const fatPercentage = Math.min(100, (fat / fatGoal) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Today's Progress
          </CardTitle>
          <CardDescription className="mt-0 flex items-center">
            <Utensils className="w-4 h-4 mr-1" />
            Daily Nutrition
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(currentCalories)} / {goalCalories} kcal
              </span>
            </div>
            <Progress value={caloriePercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs font-medium">Protein</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(protein)}g / {proteinGoal}g
                </span>
              </div>
              <Progress value={proteinPercentage} className="h-1.5" indicatorColor="bg-purple-600" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs font-medium">Carbs</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(carbs)}g / {carbsGoal}g
                </span>
              </div>
              <Progress value={carbsPercentage} className="h-1.5" indicatorColor="bg-orange-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs font-medium">Fat</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(fat)}g / {fatGoal}g
                </span>
              </div>
              <Progress value={fatPercentage} className="h-1.5" indicatorColor="bg-blue-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
