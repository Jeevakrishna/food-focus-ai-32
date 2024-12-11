import { useState, useRef } from "react";
import { Camera, Upload, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState("");

  // Update time left every minute
  useState(() => {
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

  const handleFileUpload = async (file: File) => {
    // Simulate AI analysis (replace with actual AI implementation)
    const mockAnalysis = {
      description: "Grilled chicken with rice and vegetables",
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 15,
    };

    const newMacro = {
      ...mockAnalysis,
      timestamp: new Date().toISOString(),
    };

    setMacros([...macros, newMacro]);
    
    toast({
      title: "Food tracked successfully!",
      description: mockAnalysis.description,
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive",
      });
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
          {/* Image Upload Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Track Your Food</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Upload className="w-5 h-5" />
                Upload Image
              </button>
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="mt-4 w-full rounded-lg hidden"
            />
          </div>

          {/* Macros Distribution Chart */}
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

          {/* Recent Entries */}
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