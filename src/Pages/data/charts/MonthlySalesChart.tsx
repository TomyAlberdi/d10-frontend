import { Button } from "@/components/ui/button";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

const chartConfig = {
  income: {
    label: "Ingresos $",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const MonthlySalesChart = () => {
  const { getYearlySalesData } = useDataContext();

  const [SelectedYear, setSelectedYear] = useState(2026);
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
    <div className="col-span-4 flex items-center gap-3">
      <Card className="w-3/4">
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
          <CardDescription>{SelectedYear}</CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          <ChartContainer config={chartConfig}>
            <LineChart
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
              <Line
                dataKey="income"
                type="natural"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center gap-3 w-1/4">
        <h3 className="text-xl">Seleccionar Año</h3>
        <Button
          className="w-full"
          variant="secondary"
          disabled={SelectedYear === 2026}
          onClick={() => {
            setSelectedYear(SelectedYear + 1);
          }}
        >
          <ChevronUp />
        </Button>
        <span className="text-3xl font-bold">{SelectedYear}</span>
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            setSelectedYear(SelectedYear - 1);
          }}
        >
          <ChevronDown />
        </Button>
      </div>
    </div>
  );
};
export default MonthlySalesChart;
