import { useState, useEffect } from "react";
import { CalendarIcon, Clock, Download } from "lucide-react";
import { format, differenceInSeconds, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
  const [insights, setInsights] = useState<string[]>([]);
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
      const loadedProgress = JSON.parse(savedProgress);
      setProgress(loadedProgress);
      calculateStreaks(loadedProgress);
      generateInsights(loadedProgress);
    }
  }, []);

  const calculateStreaks = (progressData: DayProgress[]) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort progress by date
    const sortedProgress = [...progressData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak
    for (const day of sortedProgress) {
      if (day.achieved) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (const day of sortedProgress) {
      if (day.achieved) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setStreaks({ current: currentStreak, longest: longestStreak });
  };

  const generateInsights = (progressData: DayProgress[]) => {
    const newInsights: string[] = [];
    
    // Check weekend patterns
    const weekendMisses = progressData.filter(day => {
      const date = new Date(day.date);
      return (date.getDay() === 0 || date.getDay() === 6) && !day.achieved;
    });

    if (weekendMisses.length > 2) {
      newInsights.push("You tend to miss your calorie goals on weekends. Consider meal prepping for Saturdays and Sundays!");
    }

    // Check successful days pattern
    const successDays = progressData.filter(day => day.achieved);
    if (successDays.length > progressData.length * 0.7) {
      newInsights.push("Great job! You're hitting your goals more than 70% of the time!");
    }

    setInsights(newInsights);
  };

  const exportData = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const monthData = progress.filter(day => {
      const date = new Date(day.date);
      return date >= monthStart && date <= monthEnd;
    });

    const csvContent = [
      ["Date", "Calories", "Goal Achieved"],
      ...monthData.map(day => [
        format(new Date(day.date), "yyyy-MM-dd"),
        day.calories.toString(),
        day.achieved ? "Yes" : "No"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calorie-tracker-${format(currentDate, "yyyy-MM")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your monthly data has been downloaded as a CSV file.",
    });
  };

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

  const DayContent = (day: Date) => {
    const dayProgress = progress.find(p => 
      isSameDay(new Date(p.date), day)
    );

    return (
      <div className={`h-full w-full rounded-full ${
        dayProgress ? (dayProgress.achieved 
          ? "bg-success/20" 
          : "bg-destructive/20"
        ) : ""
      }`}>
        <div className="h-7 w-7 flex items-center justify-center font-medium">
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
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  className="rounded-md border shadow-sm"
                  components={{
                    DayContent: ({ date }) => DayContent(date),
                  }}
                />

                <div className="flex gap-6 mt-4">
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

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-4">
                  <h2 className="font-semibold mb-3">Streak Tracker</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Current Streak: {streaks.current} days
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Longest Streak: {streaks.longest} days
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h2 className="font-semibold mb-3">Insights</h2>
                  <div className="space-y-2">
                    {insights.map((insight, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {insight}
                      </p>
                    ))}
                    {insights.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Track more days to receive personalized insights!
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={exportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Monthly Data
                </Button>
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
