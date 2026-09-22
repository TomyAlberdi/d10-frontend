import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { getMonthName } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CURRENT_YEAR, formatCompact, formatMoney } from "../components/format";

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

const MonthlySalesChart = () => {
  const { getYearlySalesData } = useDataContext();

  const [MonthlyData, setMonthlyData] = useState<
    MonthlySummaryRecord[] | null
  >(null);

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
    getYearlySalesData(CURRENT_YEAR).then(fillData).then(setMonthlyData);
  }, [getYearlySalesData, fillData]);

  const yearIncome = MonthlyData?.reduce((acc, r) => acc + r.income, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Ventas Mensuales</CardTitle>
        <CardDescription>
          Ventas cobradas y pagos de deudas · {CURRENT_YEAR}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {MonthlyData === null ? (
          <Skeleton className="aspect-video w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-video w-full">
            <BarChart
              accessibilityLayer
              data={MonthlyData}
              margin={{ left: 0, right: 12, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={"monthName"}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="settledIncome"
                stackId="income"
                fill="var(--color-settledIncome)"
              />
              <Bar
                dataKey="debtPayments"
                stackId="income"
                fill="var(--color-debtPayments)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      {MonthlyData && (
        <CardFooter className="text-muted-foreground text-sm">
          <span>
            Total del año:{" "}
            <b className="text-foreground">{formatMoney(yearIncome)}</b>
          </span>
        </CardFooter>
      )}
    </Card>
  );
};
export default MonthlySalesChart;
