import { useState, useRef, useEffect } from "react";
import { Upload, Clock, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CameraCapture } from "@/components/food/CameraCapture";
import { FoodEntryList } from "@/components/food/FoodEntryList";

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  description: string;
  health_score?: number;
  health_description?: string;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];

const Index = () => {
  const [macros, setMacros] = useState<MacroData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState({ calories: 0 });
  const [todayCalories, setTodayCalories] = useState(0);

  useEffect(() => {
    const savedGoals = localStorage.getItem("macroGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = macros.filter(entry => 
      entry.timestamp.startsWith(today)
    );
    const totalCalories = todayEntries.reduce((sum, entry) => 
      sum + entry.calories, 0
    );
    setTodayCalories(totalCalories);

    if (goals.calories > 0) {
      const remaining = goals.calories - totalCalories;
      if (remaining > 0) {
        toast({
          title: "Calorie Goal Progress",
          description: `You have ${remaining} kcal remaining today. Log your next meal to stay on track!`,
        });
      } else {
        toast({
          title: "Goal Exceeded!",
          description: `Great job! You've exceeded your goal by ${Math.abs(remaining)} kcal today!`,
        });
      }
    }
  }, [macros, goals.calories]);

  const updateTimeLeft = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diffInSeconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    
    setTimeLeft(`${hours}h ${minutes}m`);
  };

  useEffect(() => {
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  const analyzeImage = async (base64Image: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('analyze-food', {
        body: { image: base64Image }
      });

      if (response.error) throw response.error;

      const newMacro = {
        ...response.data,
        timestamp: new Date().toISOString(),
      };

      setMacros([...macros, newMacro]);
      
      toast({
        title: "Food tracked successfully!",
        description: response.data.description,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Error analyzing food",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        await analyzeImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const getTotalMacros = () => {
    const totals = macros.reduce(
      (acc, curr) => ({
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fat: acc.fat + curr.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    const total = totals.protein + totals.carbs + totals.fat;
    if (total === 0) return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: Math.round((totals.protein / total) * 100),
      carbs: Math.round((totals.carbs / total) * 100),
      fat: Math.round((totals.fat / total) * 100),
    };
  };

  const pieData = [
    { name: "Protein", value: getTotalMacros().protein },
    { name: "Carbs", value: getTotalMacros().carbs },
    { name: "Fat", value: getTotalMacros().fat },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {format(new Date(), "MMMM d, yyyy")}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span>Time until next day: {timeLeft}</span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {goals.calories > 0 && (
          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Daily Calorie Goal</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {todayCalories} / {goals.calories} kcal
              </span>
            </div>
            <Progress 
              value={(todayCalories / goals.calories) * 100} 
              className="h-3"
            />
          </div>
        )}

        <div className="grid gap-6">
          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Track Your Food</h2>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </Button>
              <CameraCapture onCapture={analyzeImage} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={isLoading}
            />
          </div>

          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Today's Macros</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
            <FoodEntryList entries={macros} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
