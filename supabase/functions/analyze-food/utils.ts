
export const calculateMacroPercentages = (calories: number, protein: number, carbs: number, fat: number) => {
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories;
  
  return {
    proteinPercentage: Math.round((proteinCalories / totalCalories) * 100) || 0,
    carbsPercentage: Math.round((carbCalories / totalCalories) * 100) || 0,
    fatPercentage: Math.round((fatCalories / totalCalories) * 100) || 0
  };
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
