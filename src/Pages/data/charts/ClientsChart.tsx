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
import type { TopClientRecord } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useDataFilters } from "../useDataFilters";

const chartConfig = {
  revenue: {
    label: "Ingresos $",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/** Long client names would eat the whole chart width. */
const shortName = (name: string) =>
  name.length > 22 ? `${name.slice(0, 21)}…` : name;

type ChartClient = TopClientRecord & { label: string };

const ClientsChart = () => {
  const { getTopClients } = useDataContext();
  const { year: SelectedYear, from, to, basis } = useDataFilters();

  const [Clients, setClients] = useState<ChartClient[]>([]);

  useEffect(() => {
    getTopClients(from, to, 10, basis).then((records) =>
      setClients(
        records.map((record) => ({
          ...record,
          revenue: parseFloat(record.revenue.toFixed(2)),
          label: shortName(record.clientName),
        })),
      ),
    );
  }, [getTopClients, from, to, basis]);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Ventas por Cliente</CardTitle>
        <CardDescription>
          {SelectedYear} · 10 principales
          {Clients.length > 0 &&
            ` · $ ${formatPrice(
              Clients.reduce((total, client) => total + client.revenue, 0),
            )}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {Clients.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={Clients}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                width={140}
                tickMargin={6}
              />
              <XAxis dataKey="revenue" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="revenue" fill="var(--chart-2)" radius={2} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay ventas con cliente asignado en {SelectedYear}.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsChart;
