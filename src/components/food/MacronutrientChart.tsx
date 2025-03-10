
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MacronutrientChartProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export const MacronutrientChart = ({ protein, carbs, fat, calories }: MacronutrientChartProps) => {
  // Calculate calories from each macronutrient
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  
  // Calculate percentages
  const totalCalories = proteinCalories + carbsCalories + fatCalories;
  const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100) || 0;
  const carbsPercentage = Math.round((carbsCalories / totalCalories) * 100) || 0;
  const fatPercentage = Math.round((fatCalories / totalCalories) * 100) || 0;

  const data = [
    { name: `Protein (${proteinPercentage}%)`, value: proteinCalories, actualValue: protein, color: '#8B5CF6' },
    { name: `Carbs (${carbsPercentage}%)`, value: carbsCalories, actualValue: carbs, color: '#F97316' },
    { name: `Fat (${fatPercentage}%)`, value: fatCalories, actualValue: fat, color: '#0EA5E9' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-sm">
          <p className="font-bold">{item.name}</p>
          <p>{item.actualValue}g ({Math.round(item.value)} calories)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium">Macronutrient Breakdown</h3>
        <p className="text-muted-foreground text-sm">Total: {calories} calories</p>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name }) => name}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
