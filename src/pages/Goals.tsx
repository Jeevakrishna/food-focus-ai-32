import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Goals = () => {
  const [goals, setGoals] = useState<MacroGoals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedGoals = localStorage.getItem("macroGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("macroGoals", JSON.stringify(goals));
    toast({
      title: "Goals Updated",
      description: "Your macro goals have been saved successfully!",
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">Daily Macro Goals</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(goals).map((macro) => (
              <div key={macro} className="space-y-2">
                <label
                  htmlFor={macro}
                  className="block text-sm font-medium text-foreground capitalize"
                >
                  {macro} {macro !== "calories" && "(g)"}
                </label>
                <input
                  type="number"
                  id={macro}
                  value={goals[macro as keyof MacroGoals]}
                  onChange={(e) =>
                    setGoals((prev) => ({
                      ...prev,
                      [macro]: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  min="0"
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Goals
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Goals;