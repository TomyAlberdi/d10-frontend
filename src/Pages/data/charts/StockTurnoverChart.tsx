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
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { StockTurnoverRecord } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useDataFilters } from "../useDataFilters";

const chartConfig = {
  turns: { label: "Rotación", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** Below this many turns over the period, the capital is barely moving. */
const SLOW_TURN_THRESHOLD = 1;

/** Recharts wraps each tooltip entry; `payload` holds the original data point. */
interface TooltipEntry {
  payload?: StockTurnoverRecord;
}

const TurnoverTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) => {
  const record = payload?.[0]?.payload;
  if (!active || !record) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{record.name}</p>
      <p className="text-muted-foreground">
        {record.unitsOut} vendidas · {record.unitsOnHand} en stock
      </p>
      <p className="text-muted-foreground">
        $ {formatPrice(record.costValue)} inmovilizados
      </p>
      <p className="text-muted-foreground">
        {record.turns !== null ? `${record.turns} rotaciones` : "Sin stock"}
        {record.daysOfSupply !== null
          ? ` · ${Math.round(record.daysOfSupply)} días de cobertura`
          : ""}
      </p>
    </div>
  );
};

const StockTurnoverChart = () => {
  const { getStockTurnover } = useDataContext();
  const { from, to, year } = useDataFilters();

  const [Records, setRecords] = useState<StockTurnoverRecord[]>([]);

  useEffect(() => {
    getStockTurnover(from, to, 60).then(setRecords);
  }, [getStockTurnover, from, to]);

  // Only products that still hold stock can be placed on a turnover axis.
  const points = Records.filter(
    (record) => record.turns !== null && record.costValue > 0,
  );
  const slowCapital = points
    .filter((record) => (record.turns ?? 0) < SLOW_TURN_THRESHOLD)
    .reduce((sum, record) => sum + record.costValue, 0);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Rotación de Stock</CardTitle>
        <CardDescription>
          {year} · $ {formatPrice(slowCapital)} en productos con menos de{" "}
          {SLOW_TURN_THRESHOLD} rotación
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {points.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="turns"
                name="Rotación"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                type="number"
                dataKey="costValue"
                name="Capital"
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(value: number) =>
                  `$${Math.round(value / 1000)}k`
                }
              />
              <ZAxis type="number" dataKey="unitsOnHand" range={[40, 220]} />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<TurnoverTooltip />}
              />
              <Scatter data={points}>
                {points.map((record) => (
                  <Cell
                    key={record.productId}
                    fill={
                      (record.turns ?? 0) < SLOW_TURN_THRESHOLD
                        ? "var(--chart-1)"
                        : "var(--chart-2)"
                    }
                    fillOpacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay movimientos de stock en el periodo seleccionado.
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Abajo a la derecha rotan bien. Arriba a la izquierda es capital
          quieto. La rotación se mide contra el stock actual, ya que el sistema
          no guarda el stock histórico.
        </p>
      </CardContent>
    </Card>
  );
};

export default StockTurnoverChart;
