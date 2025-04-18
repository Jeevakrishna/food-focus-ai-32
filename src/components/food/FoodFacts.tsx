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

    // Check if it's the specific unhealthy food (chips)
    if (lastEntry.isUnhealthy) {
      return "Bad food! Potato chips are high in calories, fat, and sodium. Regular consumption may contribute to health issues like obesity and heart disease.";
    }

    // Database of fun facts for different foods
    const foodFacts: { [key: string]: { fact: string; isGood: boolean } } = {
      banana: {
        fact: "Bananas are technically berries, and they float in water because they are 75% water! A good source of potassium and fiber.",
        isGood: true
      },
      apple: {
        fact: "Apples are members of the rose family, along with pears and plums. An apple a day really might keep the doctor away!",
        isGood: true
      },
      chicken: {
        fact: "Chicken is one of the most protein-rich foods, with about 31g of protein per 100g! Perfect for building those muscles.",
        isGood: true
      },
      rice: {
        fact: "Rice has been cultivated for more than 10,000 years and feeds half the world's population. A versatile and energy-packed good food!",
        isGood: true
      },
      egg: {
        fact: "An egg's shell can have up to 17,000 tiny pores on its surface. Nature's perfect protein package!",
        isGood: true
      },
      pizza: {
        fact: "Pizza is everyone's favorite cheat meal. Deliciously 'bad' but oh-so-satisfying! Everything in moderation, right?",
        isGood: false
      },
      burger: {
        fact: "The humble burger - America's favorite 'naughty' food. Can be part of a balanced diet if you don't overdo it!",
        isGood: false
      },
      salad: {
        fact: "Salads can pack more nutrients than almost any other single dish. Definitely a 'good food' superstar!",
        isGood: true
      },
      pasta: {
        fact: "Pasta was likely first created in China, not Italy! Complex carbs that give you energy - good food when paired with veggies.",
        isGood: true
      },
      chocolate: {
        fact: "Dark chocolate contains antioxidants that may benefit your heart. A little bit of this 'bad' food might actually be good for you!",
        isGood: false
      },
      yogurt: {
        fact: "Yogurt contains probiotics that support your gut health. A deliciously creamy good food for your microbiome!",
        isGood: true
      },
      fish: {
        fact: "Fish are rich in omega-3 fatty acids that support brain health. Definitely swimming in the 'good food' category!",
        isGood: true
      }
    };

    // Check if we have a specific fact for this food
    for (const [key, { fact, isGood }] of Object.entries(foodFacts)) {
      if (foodName.includes(key)) {
        const goodBadLabel = isGood ? "Good food!" : "Treat food!";
        return `${goodBadLabel} ${fact}`;
      }
    }

    // Default fact if no specific food is recognized
    return "Every food you eat has a unique story and nutritional profile! Remember, balance is key - enjoy a variety of foods for optimal health.";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {entries.length > 0 && entries[entries.length - 1].isUnhealthy 
            ? "Food Warning"
            : "Fun Fact About Your Food"
          }
        </CardTitle>
        <CardDescription>
          {entries.length > 0 && entries[entries.length - 1].isUnhealthy 
            ? "Health Information"
            : "Learn something new about your food"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{getFunFact()}</p>
      </CardContent>
    </Card>
  );
};
