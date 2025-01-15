import { format } from "date-fns";
import { HealthIndicator } from "./HealthIndicator";
import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FoodEntry {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  health_score?: number;
  health_description?: string;
  confidence?: number;
  source?: 'local' | 'ai';
}

interface FoodEntryListProps {
  entries: FoodEntry[];
  title?: string;
}

export const FoodEntryList = ({ entries, title = "Recent Entries" }: FoodEntryListProps) => {
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{entry.description}</p>
                      {entry.source && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {entry.source === 'local' ? 'Dataset' : 'AI'} 
                          {entry.confidence && `(${Math.round(entry.confidence * 100)}%)`}
                        </span>
                      )}
                    </div>
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
      </CardContent>
    </Card>
  );
};