interface HealthIndicatorProps {
  score: number;
  description: string;
}

export const HealthIndicator = ({ score, description }: HealthIndicatorProps) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${getHealthColor(score)}`}
        ></div>
        <span className="font-medium">Health Score: {score}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};