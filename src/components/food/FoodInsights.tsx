import { Brain, Lightbulb, TrendingUp } from "lucide-react";
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
}

interface FoodInsightsProps {
  entries: FoodEntry[];
}

export const FoodInsights = ({ entries }: FoodInsightsProps) => {
  const analyzeMealPatterns = () => {
    if (entries.length === 0) return null;

    const weekendEntries = entries.filter(entry => {
      const day = new Date(entry.timestamp).getDay();
      return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
    });

    const weekdayEntries = entries.filter(entry => {
      const day = new Date(entry.timestamp).getDay();
      return day !== 0 && day !== 6;
    });

    const avgWeekendCalories = weekendEntries.reduce((sum, entry) => sum + entry.calories, 0) / weekendEntries.length;
    const avgWeekdayCalories = weekdayEntries.reduce((sum, entry) => sum + entry.calories, 0) / weekdayEntries.length;

    if (avgWeekendCalories > avgWeekdayCalories * 1.2) {
      return "You tend to consume more calories on weekends. Consider meal prepping for weekends to stay on track!";
    }
    return "Your calorie intake is fairly consistent throughout the week. Great job maintaining consistency!";
  };

  const suggestNextMeal = () => {
    if (entries.length === 0) return null;

    const recentEntries = entries.slice(-3);
    const totalProtein = recentEntries.reduce((sum, entry) => sum + entry.protein, 0);
    const totalCarbs = recentEntries.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalFat = recentEntries.reduce((sum, entry) => sum + entry.fat, 0);

    if (totalProtein < 50) {
      return "Consider adding a protein-rich meal like grilled chicken or fish with vegetables.";
    } else if (totalCarbs < 100) {
      return "You might benefit from complex carbs like quinoa or sweet potatoes in your next meal.";
    } else if (totalFat < 30) {
      return "Try adding healthy fats like avocado or nuts to balance your macros.";
    }
    return "Your recent meals are well-balanced! Keep up the good work!";
  };

  const getInterestingFact = () => {
    const facts = [
      "Did you know? The word 'protein' comes from the Greek word 'protos', meaning 'first' - reflecting its fundamental importance in nutrition.",
      "Carbohydrates are your brain's preferred source of energy!",
      "Your body can store enough carbohydrates to fuel about 2,000 calories worth of physical activity.",
      "Healthy fats are essential for absorbing vitamins A, D, E, and K.",
      "The human body can only store protein for a short time, which is why regular intake is important.",
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Pattern Analysis
          </CardTitle>
          <CardDescription>Your eating patterns and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analyzeMealPatterns()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Meal Suggestion
          </CardTitle>
          <CardDescription>AI-powered recommendation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{suggestNextMeal()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Fun Fact
          </CardTitle>
          <CardDescription>Learn something new</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{getInterestingFact()}</p>
        </CardContent>
      </Card>
    </div>
  );
};