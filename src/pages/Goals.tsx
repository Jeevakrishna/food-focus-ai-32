import { useState } from "react";
import { Target } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save goals to localStorage
    localStorage.setItem("macroGoals", JSON.stringify(goals));
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">Daily Macro Goals</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(goals).map((macro) => (
              <div key={macro} className="space-y-2">
                <label
                  htmlFor={macro}
                  className="block text-sm font-medium text-gray-700 capitalize"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
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