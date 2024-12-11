import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  description: string;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];

const Index = () => {
  const [macros, setMacros] = useState<MacroData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = async () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg');
      await analyzeImage(base64Image);
      stopCamera();
    }
  };

  const getTotalMacros = () => {
    return macros.reduce(
      (acc, curr) => ({
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fat: acc.fat + curr.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  };

  const pieData = [
    { name: "Protein", value: getTotalMacros().protein },
    { name: "Carbs", value: getTotalMacros().carbs },
    { name: "Fat", value: getTotalMacros().fat },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">
            {format(new Date(), "MMMM d, yyyy")}
          </p>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Time until next day: {timeLeft}</span>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Track Your Food</h2>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isCameraActive}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </Button>
              <Button
                onClick={isCameraActive ? captureImage : startCamera}
                disabled={isLoading}
              >
                <Camera className="w-5 h-5 mr-2" />
                {isCameraActive ? 'Capture' : 'Take Photo'}
              </Button>
              {isCameraActive && (
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={isLoading || isCameraActive}
            />
            {isCameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="mt-4 w-full max-w-md mx-auto rounded-lg"
              />
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-gray-100">
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

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
            <div className="space-y-4">
              {macros.map((macro, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <p className="font-medium">{macro.description}</p>
                  <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                    <span>Calories: {macro.calories}</span>
                    <span>Protein: {macro.protein}g</span>
                    <span>Carbs: {macro.carbs}g</span>
                    <span>Fat: {macro.fat}g</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(macro.timestamp), "h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;