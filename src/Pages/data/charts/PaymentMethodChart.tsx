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
import type { PaymentMethodRecord } from "@/interfaces/DataInterfaces";
import { getMonthName } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useDataFilters } from "../useDataFilters";

const chartConfig = {
  cash: { label: "Efectivo $", color: "var(--chart-1)" },
  digital: { label: "Digital $", color: "var(--chart-2)" },
  usd: { label: "Dolares $", color: "var(--chart-4)" },
  unspecified: { label: "Sin especificar $", color: "var(--chart-5)" },
} satisfies ChartConfig;

const PaymentMethodChart = () => {
  const { getRevenueByPaymentMethod } = useDataContext();
  const { year, basis } = useDataFilters();

  const [Records, setRecords] = useState<PaymentMethodRecord[]>([]);

  useEffect(() => {
    getRevenueByPaymentMethod(year, basis).then((records) =>
      setRecords(
        records.map((record) => ({
          ...record,
          monthName: getMonthName(record.month),
        })),
      ),
    );
  }, [getRevenueByPaymentMethod, year, basis]);

  const unspecifiedTotal = Records.reduce(
    (sum, record) => sum + record.unspecified,
    0,
  );
  const overallTotal = Records.reduce((sum, record) => sum + record.total, 0);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Ventas por Medio de Pago</CardTitle>
        <CardDescription>{year}</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={Records} margin={{ left: 10, right: 10 }}>
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
            <Area
              dataKey="cash"
              type="natural"
              stackId="a"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.5}
            />
            <Area
              dataKey="digital"
              type="natural"
              stackId="a"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.5}
            />
            <Area
              dataKey="usd"
              type="natural"
              stackId="a"
              stroke="var(--chart-4)"
              fill="var(--chart-4)"
              fillOpacity={0.5}
            />
            <Area
              dataKey="unspecified"
              type="natural"
              stackId="a"
              stroke="var(--chart-5)"
              fill="var(--chart-5)"
              fillOpacity={0.5}
            />
          </AreaChart>
        </ChartContainer>
        {overallTotal > 0 && unspecifiedTotal / overallTotal > 0.5 && (
          <p className="text-xs text-muted-foreground mt-3">
            La mayor parte de las ventas no tiene medio de pago registrado: el
            campo se agrego despues de que el sistema ya estaba en uso.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodChart;
