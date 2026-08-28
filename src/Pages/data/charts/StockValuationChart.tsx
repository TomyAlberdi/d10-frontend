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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type {
  StockGroupBy,
  StockValuationRecord,
} from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  costValue: { label: "Costo $", color: "var(--chart-3)" },
  potentialMargin: { label: "Margen potencial $", color: "var(--chart-2)" },
} satisfies ChartConfig;

const GROUP_OPTIONS: { value: StockGroupBy; label: string }[] = [
  { value: "CATEGORY", label: "Por rubro" },
  { value: "SUBCATEGORY", label: "Por subrubro" },
  { value: "PROVIDER", label: "Por proveedor" },
  { value: "QUALITY", label: "Por calidad" },
];

const StockValuationChart = () => {
  const { getStockValuation } = useDataContext();

  const [GroupBy, setGroupBy] = useState<StockGroupBy>("CATEGORY");
  const [Records, setRecords] = useState<StockValuationRecord[]>([]);

  useEffect(() => {
    getStockValuation(GroupBy).then(setRecords);
  }, [getStockValuation, GroupBy]);

  const totalCost = Records.reduce((sum, record) => sum + record.costValue, 0);
  const totalRetail = Records.reduce(
    (sum, record) => sum + record.retailValue,
    0,
  );
  const units = Records.reduce((sum, record) => sum + record.unitsOnHand, 0);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Valor del Stock</CardTitle>
        <CardDescription>
          $ {formatPrice(totalCost)} al costo · $ {formatPrice(totalRetail)} a
          precio de venta · {units} unidades
        </CardDescription>
        <div className="pt-2">
          <Select
            value={GroupBy}
            onValueChange={(value) => setGroupBy(value as StockGroupBy)}
          >
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Agrupar" />
            </SelectTrigger>
            <SelectContent>
              {GROUP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-3">
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
            <XAxis type="number" hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="costValue"
              stackId="a"
              fill="var(--chart-3)"
              radius={2}
            />
            <Bar
              dataKey="potentialMargin"
              stackId="a"
              fill="var(--chart-2)"
              radius={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StockValuationChart;
