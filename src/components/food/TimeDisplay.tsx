
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";

export const TimeDisplay = () => {
  const [timeLeft, setTimeLeft] = useState("");

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

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">
        {format(new Date(), "MMMM d, yyyy")}
      </p>
      <div className="flex items-center text-sm text-muted-foreground">
        <Clock className="w-4 h-4 mr-1" />
        <span>Time until next day: {timeLeft}</span>
      </div>
    </div>
  );
};
