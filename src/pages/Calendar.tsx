import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const Calendar = () => {
  const [currentDate] = useState(new Date(2024, 11, 11)); // December 11, 2024

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  // Mock data for calendar (replace with actual data)
  const mockAchievements = {
    "2024-12-10": true, // Goal achieved
    "2024-12-04": false, // Goal not achieved
  };

  const getDayStatus = (day: number) => {
    const dateStr = format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      "yyyy-MM-dd"
    );
    return mockAchievements[dateStr];
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </h1>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-sm font-medium text-gray-500">
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
              
              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    status === undefined
                      ? "bg-gray-50"
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
            <span className="text-sm text-gray-600">Goals Achieved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive/20" />
            <span className="text-sm text-gray-600">Goals Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;