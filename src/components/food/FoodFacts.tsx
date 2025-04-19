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
}

interface FoodFactsProps {
  entries: FoodEntry[];
}

export const FoodFacts = ({ entries }: FoodFactsProps) => {
  const getFunFact = () => {
    if (entries.length === 0) {
      return "Upload your first food item to get interesting food facts!";
    }

    const lastEntry = entries[entries.length - 1];
    const foodName = lastEntry.description.toLowerCase();

    // Add more food facts as needed
    const foodFacts: { [key: string]: string } = {
      banana: "Bananas are technically berries, and they float in water because they are 75% water!",
      apple: "Apples are members of the rose family, along with pears and plums.",
      chicken: "Chicken is one of the most protein-rich foods, with about 31g of protein per 100g!",
      rice: "Rice has been cultivated for more than 10,000 years and feeds half the world's population.",
      egg: "An egg's shell can have up to 17,000 tiny pores on its surface.",
      default: "Every food you eat has a unique story and nutritional profile that contributes to your health!"
    };

    // Check if we have a specific fact for this food
    for (const [key, fact] of Object.entries(foodFacts)) {
      if (foodName.includes(key)) {
        return `Did you know that ${fact}`;
      }
    }

    return foodFacts.default;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Fun Fact About Your Food
        </CardTitle>
        <CardDescription>Learn something new about your food</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{getFunFact()}</p>
      </CardContent>
    </Card>
  );
};