import { useState, useEffect } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format, differenceInSeconds, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";

interface DayProgress {
  date: string;
  achieved: boolean;
  calories: number;
}

const CalendarPage = () => {
  const [currentDate] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const { toast } = useToast();
  const [calorieGoal] = useState(() => {
    const saved = localStorage.getItem("macroGoals");
    if (saved) {
      const goals = JSON.parse(saved);
      return goals.calories || 0;
    }
    return 0;
  });

  // Load progress data from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("calorieProgress");
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diffInSeconds = differenceInSeconds(tomorrow, now);
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  // Custom day content renderer for the Calendar
  const DayContent = (day: Date) => {
    const dayProgress = progress.find(p => 
      isSameDay(new Date(p.date), day)
    );

    if (!dayProgress) return null;

    return (
      <div className={`h-full w-full rounded-full ${
        dayProgress.achieved 
          ? "bg-success/20" 
          : "bg-destructive/20"
      }`}>
        <div className="h-7 w-7 flex items-center justify-center">
          {format(day, "d")}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold">
                Progress Calendar
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time until next day: {timeLeft}</span>
            </div>
          </div>

          {calorieGoal ? (
            <div className="flex flex-col items-center space-y-6">
              <Calendar
                mode="single"
                selected={currentDate}
                components={{
                  DayContent: ({ date }) => DayContent(date),
                }}
              />

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-success/20" />
                  <span className="text-sm text-muted-foreground">Goal Achieved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-destructive/20" />
                  <span className="text-sm text-muted-foreground">Goal Missed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Set your daily calorie goal in the Goals page to start tracking your progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;