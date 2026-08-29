import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { MonthlySummaryRecord } from "@/interfaces/DataInterfaces";
import { getMonthName } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

/**
 * The bar is the money the month took in, split by where it came from. A sale
 * left on account still brings cash in when the client pays part of it, and
 * showing that part next to the settled sales is what keeps the month from
 * looking emptier than it was.
 */
const chartConfig = {
  settledIncome: {
    label: "Ventas cobradas $",
    color: "var(--chart-2)",
  },
  debtPayments: {
    label: "Pagos de deudas $",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const MonthlySalesChart = ({ SelectedYear }: { SelectedYear: number }) => {
  const { getYearlySalesData } = useDataContext();

  const [MonthlyData, setMonthlyData] = useState<MonthlySummaryRecord[]>([]);

  const fillData = useCallback((data: MonthlySummaryRecord[]) => {
    const filledData = data.map((record) => ({
      ...record,
      income: parseFloat(record.income.toFixed(2)),
      settledIncome: parseFloat(record.settledIncome.toFixed(2)),
      debtPayments: parseFloat(record.debtPayments.toFixed(2)),
      monthName: getMonthName(record.month),
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="settledIncome"
              stackId="income"
              stroke="var(--color-settledIncome)"
              fill="var(--color-settledIncome)"
              strokeWidth={2}
            />
            <Bar
              dataKey="debtPayments"
              stackId="income"
              stroke="var(--color-debtPayments)"
              fill="var(--color-debtPayments)"
              strokeWidth={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
export default MonthlySalesChart;
