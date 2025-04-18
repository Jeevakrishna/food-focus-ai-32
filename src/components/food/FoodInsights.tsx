import { Brain } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FoodEntry {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  isUnhealthy?: boolean;
}

interface FoodInsightsProps {
  entries: FoodEntry[];
}

export const FoodInsights = ({ entries }: FoodInsightsProps) => {
  // Check if we should show the insights at all
  const shouldShowInsights = () => {
    if (entries.length === 0) return true;
    
    const lastEntry = entries[entries.length - 1];
    // If it's chips, we don't want to show meal suggestions
    if (lastEntry.description.toLowerCase() === "chips" || lastEntry.isUnhealthy) {
      return false;
    }
    return true;
  };

  if (!shouldShowInsights()) {
    return null; // Don't render anything if the last food was chips
  }

  const suggestNextMeal = () => {
    if (entries.length === 0) {
      return "Try starting with a balanced breakfast like oatmeal with fruits and nuts.";
    }

    // Check if the last entry is unhealthy food (chips)
    const lastEntry = entries[entries.length - 1];
    if (lastEntry.description.toLowerCase() === "chips" || lastEntry.isUnhealthy) {
      return "Consider drinking more water today to help your body process the sodium from processed foods.";
    }

    const recentEntries = entries.slice(-3);
    const totalProtein = recentEntries.reduce((sum, entry) => sum + entry.protein, 0);
    const totalCarbs = recentEntries.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalFat = recentEntries.reduce((sum, entry) => sum + entry.fat, 0);
    const totalCalories = recentEntries.reduce((sum, entry) => sum + entry.calories, 0);

    // Suggest meals based on nutritional needs
    if (totalProtein < 50) {
      return "Try grilled chicken breast with quinoa and roasted vegetables. This meal is high in protein and provides balanced nutrients.";
    } else if (totalCarbs < 100) {
      return "How about sweet potato with black beans and brown rice? This combination provides complex carbs and fiber.";
    } else if (totalFat < 30) {
      return "Consider salmon with avocado and mixed greens. This meal offers healthy fats and omega-3s.";
    } else if (totalCalories < 1200) {
      return "A balanced meal of turkey wrap with whole grain tortilla, hummus, and vegetables would be perfect.";
    }

    return "A light meal of Greek salad with grilled tofu would be a great choice to maintain your balanced intake.";
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Meal Suggestion
          </CardTitle>
          <CardDescription>Based on your recent nutrition intake</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{suggestNextMeal()}</p>
        </CardContent>
      </Card>
    </div>
  );
};
