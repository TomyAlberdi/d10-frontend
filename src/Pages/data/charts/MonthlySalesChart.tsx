import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { MonthlySummaryRecord } from "@/interfaces/DataInterfaces";
import { getMonthName } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  income: {
    label: "Ingresos $",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const MonthlySalesChart = ({ SelectedYear }: { SelectedYear: number }) => {
  const { getYearlySalesData } = useDataContext();

  const [MonthlyData, setMonthlyData] = useState<MonthlySummaryRecord[]>([]);

  const fillData = useCallback((data: MonthlySummaryRecord[]) => {
    const filledData = data.map((record, index) => ({
      ...record,
      income: parseFloat(record.income.toFixed(2)),
      monthName: getMonthName(index + 1),
    }));
    return filledData;
  }, []);

  useEffect(() => {
    getYearlySalesData(SelectedYear).then(fillData).then(setMonthlyData);
  }, [getYearlySalesData, fillData, SelectedYear]);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Ingresos por Ventas Mensuales</CardTitle>
        <CardDescription>{SelectedYear}</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={MonthlyData}
            margin={{ left: 10, right: 10 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={"monthName"}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="income"
              type="natural"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              strokeWidth={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
export default MonthlySalesChart;
