import { useState, useRef, useEffect } from "react";
import { Upload, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/food/CameraCapture";
import { FoodEntryList } from "@/components/food/FoodEntryList";
import { FoodInsights } from "@/components/food/FoodInsights";
import { FoodFacts } from "@/components/food/FoodFacts";
import { DailyProgress } from "@/components/food/DailyProgress";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { 
  saveFoodEntry, 
  getFoodEntries, 
  getTodayEntries,
  getDailyTotals,
  clearOldEntries 
} from "@/utils/foodEntryManager";

const Index = () => {
  const [entries, setEntries] = useState(getFoodEntries());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [goals] = useState(() => {
    const saved = localStorage.getItem("macroGoals");
    return saved ? JSON.parse(saved) : {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70
    };
  });

  useEffect(() => {
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

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);

    // Clear old entries at midnight
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        clearOldEntries();
        setEntries(getFoodEntries());
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(midnightCheck);
    };
  }, []);

  const analyzeImage = async (base64Image: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { image: base64Image }
      });

      if (error) throw new Error(error.message || 'Failed to analyze food');
      if (!data) throw new Error('No data returned from analysis');

      const newEntry = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      saveFoodEntry(newEntry);
      setEntries(getFoodEntries());
      
      const totals = getDailyTotals();
      const goalMet = totals.calories >= goals.calories;
      
      toast({
        title: goalMet ? "Daily Goal Achieved! 🎉" : "Food tracked successfully!",
        description: data.description,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Error analyzing food",
        description: error.message || "Failed to analyze the image. Please try again.",
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

  const totals = getDailyTotals();
  
  // Calculate macro percentages
  const totalMacros = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9; // Convert to calories
  const macroData = [
    { name: 'Protein', value: totals.protein * 4, color: '#FF6B6B' },
    { name: 'Carbs', value: totals.carbs * 4, color: '#4ECDC4' },
    { name: 'Fat', value: totals.fat * 9, color: '#FFD93D' }
  ].map(item => ({
    ...item,
    percentage: totalMacros > 0 ? Math.round((item.value / totalMacros) * 100) : 0
  }));

  return (
    <div className="min-h-screen pb-20 bg-white">
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Macro Distribution</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

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
