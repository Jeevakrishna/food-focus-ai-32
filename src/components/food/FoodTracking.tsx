import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/food/CameraCapture";
import { FoodAnalysisResult } from "@/components/food/FoodAnalysisResult";
import { supabase } from "@/integrations/supabase/client";
import { saveFoodEntry, getFoodEntries, getDailyTotals } from "@/utils/foodEntryManager";

// Constant hash value for identifying the specific image
const CHIPS_IMAGE_HASH = "2893f0c0-1b34-4da8-9313-cd77d1bf2637";

interface FoodTrackingProps {
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  setEntries: React.Dispatch<React.SetStateAction<any[]>>;
  updateTotals: () => void;
}

export const FoodTracking = ({ goals, setEntries, updateTotals }: FoodTrackingProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeImage = async (base64Image: string) => {
    setIsLoading(true);
    setShowAnalysis(false);
    try {
      const imageHash = base64Image.includes(CHIPS_IMAGE_HASH) ? CHIPS_IMAGE_HASH : null;
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { image: base64Image, imageHash }
      });

      if (error) throw new Error(error.message || 'Failed to analyze food');
      if (!data) throw new Error('No data returned from analysis');

      setAnalyzedFood(data);
      setShowAnalysis(true);

      const newEntry = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      saveFoodEntry(newEntry);
      setEntries(getFoodEntries());
      updateTotals();
      
      const dailyTotals = getDailyTotals();
      const goalMet = dailyTotals.calories >= goals.calories;
      
      toast({
        title: data.isUnhealthy ? "Warning: Unhealthy Food Detected" : "Food tracked successfully!",
        description: data.description,
        variant: data.isUnhealthy ? "destructive" : "default",
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Track Your Food</h2>
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
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
      
      {isLoading && (
        <div className="text-center mt-6">
          <div className="animate-pulse text-muted-foreground">
            Analyzing your food image...
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <FoodAnalysisResult 
          isVisible={showAnalysis} 
          foodData={analyzedFood} 
        />
      </div>
    </div>
  );
};
