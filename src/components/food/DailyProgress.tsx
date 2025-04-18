
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  fatGoal,
}: DailyProgressProps) => {
  const calorieProgress = Math.min((currentCalories / goalCalories) * 100, 100);
  const proteinProgress = Math.min((protein / proteinGoal) * 100, 100);
  const carbsProgress = Math.min((carbs / carbsGoal) * 100, 100);
  const fatProgress = Math.min((fat / fatGoal) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Calories</span>
            <span>{currentCalories} / {goalCalories} kcal</span>
          </div>
          <Progress value={calorieProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Protein</span>
            <span>{protein}g / {proteinGoal}g</span>
          </div>
          <Progress value={proteinProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Carbs</span>
            <span>{carbs}g / {carbsGoal}g</span>
          </div>
          <Progress value={carbsProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fat</span>
            <span>{fat}g / {fatGoal}g</span>
          </div>
          <Progress value={fatProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
