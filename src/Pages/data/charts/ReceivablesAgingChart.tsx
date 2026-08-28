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
import type { ReceivableBucket } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

const chartConfig = {
  outstanding: { label: "Saldo $", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** Older debt is worse debt, so the bars shift colour with age. */
const BUCKET_COLORS = [
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
];

const ReceivablesAgingChart = () => {
  const { getReceivablesAging } = useDataContext();

  const [Buckets, setBuckets] = useState<ReceivableBucket[]>([]);

  useEffect(() => {
    getReceivablesAging().then(setBuckets);
  }, [getReceivablesAging]);

  const total = Buckets.reduce((sum, bucket) => sum + bucket.outstanding, 0);
  const invoices = Buckets.reduce(
    (sum, bucket) => sum + bucket.invoiceCount,
    0,
  );

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Antigüedad de la Deuda</CardTitle>
        <CardDescription>
          $ {formatPrice(total)} en {invoices} ventas entregadas sin cobrar
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {total > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={Buckets}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="bucket"
                type="category"
                tickLine={false}
                axisLine={false}
                width={70}
                tickMargin={6}
              />
              <XAxis dataKey="outstanding" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="outstanding" radius={2}>
                {Buckets.map((bucket, index) => (
                  <Cell
                    key={bucket.bucket}
                    fill={BUCKET_COLORS[index % BUCKET_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay deuda pendiente registrada.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReceivablesAgingChart;
