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
import type { MonthlySalesRecord } from "@/interfaces/DataInterfaces";
import { getMonthName } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useDataFilters } from "../useDataFilters";

type MonthRow = { monthName: string } & Record<string, number | string>;

const MonthlySalesComparison = () => {
  const { getMonthlySales } = useDataContext();
  const { year, basis } = useDataFilters();

  const [Records, setRecords] = useState<MonthlySalesRecord[]>([]);

  useEffect(() => {
    getMonthlySales([year - 1, year], basis).then(setRecords);
  }, [getMonthlySales, year, basis]);

  // The endpoint returns one flat row per year and month; the chart wants one
  // row per month with a series per year.
  const rows = useMemo<MonthRow[]>(() => {
    const byMonth = new Map<number, MonthRow>();
    for (let month = 1; month <= 12; month++) {
      byMonth.set(month, { monthName: getMonthName(month) });
    }
    Records.forEach((record) => {
      const row = byMonth.get(record.month);
      if (row) row[String(record.year)] = record.income;
    });
    return Array.from(byMonth.values());
  }, [Records]);

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      [String(year - 1)]: {
        label: `${year - 1} $`,
        color: "var(--chart-3)",
      },
      [String(year)]: { label: `${year} $`, color: "var(--chart-2)" },
    }),
    [year],
  );

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Ingresos por Ventas Mensuales</CardTitle>
        <CardDescription>
          {year} comparado con {year - 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={rows} margin={{ left: 10, right: 10 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="monthName"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey={String(year - 1)} fill="var(--chart-3)" radius={2} />
            <Bar dataKey={String(year)} fill="var(--chart-2)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesComparison;
