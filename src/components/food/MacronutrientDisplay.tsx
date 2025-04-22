
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { foodDatabase } from "@/utils/foodDataset";

export const MacronutrientDisplay = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Food Macronutrients</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Protein (g)</TableHead>
              <TableHead>Carbs (g)</TableHead>
              <TableHead>Fat (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(foodDatabase).map(([food, macros]) => (
              <TableRow key={food}>
                <TableCell className="font-medium capitalize">{food}</TableCell>
                <TableCell>{macros.calories}</TableCell>
                <TableCell>{macros.protein}</TableCell>
                <TableCell>{macros.carbs}</TableCell>
                <TableCell>{macros.fat}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
