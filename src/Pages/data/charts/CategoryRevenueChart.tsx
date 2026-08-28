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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type {
  CategoryLevel,
  CategoryRevenueRecord,
} from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useDataFilters } from "../useDataFilters";

const chartConfig = {
  revenue: { label: "Ingresos $", color: "var(--chart-2)" },
} satisfies ChartConfig;

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CategoryRevenueChart = () => {
  const { getRevenueByCategory } = useDataContext();
  const { from, to, basis, year } = useDataFilters();

  const [Level, setLevel] = useState<CategoryLevel>("CATEGORY");
  const [Records, setRecords] = useState<CategoryRevenueRecord[]>([]);

  useEffect(() => {
    getRevenueByCategory(from, to, Level, basis).then(setRecords);
  }, [getRevenueByCategory, from, to, Level, basis]);

  const total = Records.reduce((sum, record) => sum + record.revenue, 0);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Ingresos por Rubro</CardTitle>
        <CardDescription>
          {year} · $ {formatPrice(total)}
        </CardDescription>
        <RadioGroup
          value={Level}
          onValueChange={(value) => setLevel(value as CategoryLevel)}
          className="flex gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CATEGORY" id="level-category" />
            <Label htmlFor="level-category" className="cursor-pointer">
              Rubro
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SUBCATEGORY" id="level-subcategory" />
            <Label htmlFor="level-subcategory" className="cursor-pointer">
              Subrubro
            </Label>
          </div>
        </RadioGroup>
      </CardHeader>
      <CardContent className="px-3">
        {Records.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={Records}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="key"
                type="category"
                tickLine={false}
                axisLine={false}
                width={150}
                tickMargin={6}
              />
              <XAxis dataKey="revenue" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="revenue" radius={2}>
                {Records.map((record, index) => (
                  <Cell
                    key={record.key}
                    fill={PALETTE[index % PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay ventas en el periodo seleccionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryRevenueChart;
