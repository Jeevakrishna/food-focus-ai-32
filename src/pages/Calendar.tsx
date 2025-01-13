import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DayProgress {
  date: string;
  achieved: boolean;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const Calendar = () => {
  const [currentDate] = useState(new Date(2024, 11, 11));
  const [timeLeft, setTimeLeft] = useState("");
  const { toast } = useToast();
  
  // Mock data for calendar progress
  const mockProgress: { [key: string]: DayProgress } = {
    "2024-12-10": {
      date: "2024-12-10",
      achieved: true,
      macros: { calories: 2100, protein: 150, carbs: 200, fat: 70 }
    },
    "2024-12-04": {
      date: "2024-12-04",
      achieved: false,
      macros: { calories: 1500, protein: 90, carbs: 150, fat: 50 }
    }
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

  useEffect(() => {
    // Show welcome toast when component mounts
    toast({
      title: "New Day Started!",
      description: `Let's log your meals for ${format(currentDate, "MMMM d")} to stay on track with your goals.`,
    });
  }, []);

  const getDayStatus = (day: number) => {
    const dateStr = format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      "yyyy-MM-dd"
    );
    return mockProgress[dateStr]?.achieved;
  };

  const { daysInMonth, firstDayOfMonth } = {
    daysInMonth: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate(),
    firstDayOfMonth: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay(),
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time until next day: {timeLeft}</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const status = getDayStatus(day);
              const isCurrentDay = day === currentDate.getDate();
              
              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    isCurrentDay
                      ? "bg-primary text-primary-foreground"
                      : status === undefined
                      ? "bg-card"
                      : status
                      ? "bg-success/20 text-success"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-success/20" />
            <span className="text-sm text-muted-foreground">Goals Achieved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive/20" />
            <span className="text-sm text-muted-foreground">Goals Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Current Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;