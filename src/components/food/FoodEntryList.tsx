import { format } from "date-fns";
import { HealthIndicator } from "./HealthIndicator";

interface FoodEntry {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  health_score?: number;
  health_description?: string;
}

interface FoodEntryListProps {
  entries: FoodEntry[];
}

export const FoodEntryList = ({ entries }: FoodEntryListProps) => {
  const groupEntriesByDate = (entries: FoodEntry[]) => {
    const groups: { [key: string]: FoodEntry[] } = {};
    entries.forEach((entry) => {
      const date = format(new Date(entry.timestamp), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  };

  const groupedEntries = groupEntriesByDate(entries);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEntries).map(([date, entries]) => (
        <div key={date} className="space-y-4">
          <h3 className="font-semibold">
            {format(new Date(date), "EEEE, MMMM d")}
          </h3>
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-card border animate-fadeIn"
              >
                <p className="font-medium">{entry.description}</p>
                <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <span>Calories: {entry.calories}</span>
                  <span>Protein: {entry.protein}g</span>
                  <span>Carbs: {entry.carbs}g</span>
                  <span>Fat: {entry.fat}g</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(entry.timestamp), "h:mm a")}
                </p>
                {entry.health_score && entry.health_description && (
                  <div className="mt-3">
                    <HealthIndicator
                      score={entry.health_score}
                      description={entry.health_description}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};