import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MonthlyExpensesChart = ({ SelectedYear }: { SelectedYear: number }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Gastos Mensuales</CardTitle>
        <CardDescription>{SelectedYear}</CardDescription>
      </CardHeader>
    </Card>
  );
};
export default MonthlyExpensesChart;
