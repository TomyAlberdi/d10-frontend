import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type {
  PriceLog,
  PriceLogSource,
  PriceSnapshot,
  Product,
} from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import { formatCompact } from "../data/components/format";
import { ChevronLeft, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

const SOURCE_LABELS: Record<PriceLogSource, string> = {
  CREATED: "Alta",
  EDITED: "Edición",
  PROVIDER_UPDATE: "Act. proveedor",
};

const formatDateTime = (value: string | number): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (value: number): string =>
  new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

const formatTime = (value: number): string =>
  new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const DAY_MS = 24 * 60 * 60 * 1000;

const formatMoney = (value: number | null | undefined) =>
  value == null ? "—" : `$ ${formatPrice(value)}`;

const formatPercent = (value: number | null | undefined) =>
  value == null ? "—" : `${formatPrice(value)} %`;

/** Relative change from `from` to `to`, null when it cannot be computed. */
const percentChange = (
  from: number | null | undefined,
  to: number | null | undefined,
) => (from && to != null ? ((to - from) / from) * 100 : null);

const formatChange = (change: number | null) =>
  change == null
    ? null
    : `${change > 0 ? "+" : ""}${change.toLocaleString("es-AR", {
        maximumFractionDigits: 1,
      })} %`;

/**
 * One cell of the table: the value after the change and, when it moved, what
 * it was before.
 */
const ChangeCell = ({
  field,
  log,
  format,
  relative = true,
}: {
  field: keyof PriceSnapshot;
  log: PriceLog;
  format: (value: number | null | undefined) => string;
  /** Margins are already percentages, so their change is shown in points. */
  relative?: boolean;
}) => {
  const before = log.previous?.[field];
  const after = log.current[field];
  const changed = log.previous !== null && before !== after;
  const delta = relative
    ? formatChange(percentChange(before, after))
    : before != null && after != null
      ? `${after - before > 0 ? "+" : ""}${formatPrice(after - before)} pp`
      : null;
  return (
    <TableCell className="text-right align-top">
      <p className={changed ? "font-semibold" : undefined}>{format(after)}</p>
      {changed && (
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          antes {format(before)}
        </p>
      )}
      {changed && delta && (
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {delta}
        </p>
      )}
    </TableCell>
  );
};

const ProductPriceHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getProductById, getPriceHistory } = useProductContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [priceLogs, setPriceLogs] = useState<PriceLog[]>([]);
  // When the data was fetched; the chart's last step runs up to it.
  const [loadedAt, setLoadedAt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([getProductById(id), getPriceHistory(id)])
      .then(([fetchedProduct, logs]) => {
        if (cancelled) return;
        setProduct(fetchedProduct);
        setPriceLogs(logs);
        setLoadedAt(Date.now());
      })
      .catch((err) => {
        console.error("Error fetching price history:", err);
        if (!cancelled) setError("Error al cargar el historial de precios");
        toast.error("Error al cargar el historial de precios");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // The context functions are recreated on every render of the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const measureUnit = product?.measureType ?? priceLogs[0]?.measureType ?? "";

  const chartConfig = {
    price: {
      label: `Precio por ${measureUnit} $`,
      color: "var(--chart-1)",
    },
    cost: {
      label: `Costo por ${measureUnit} $`,
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  // Oldest first, each price held until the next change, and a closing point
  // at load time so the last step reaches the present.
  const chartData = useMemo(() => {
    const points = [...priceLogs].reverse().map((log) => ({
      time: new Date(log.datetime).getTime(),
      price: log.current.priceByMeasureUnit,
      cost: log.current.costByMeasureUnit,
    }));
    if (product && points.length > 0) {
      points.push({
        time: loadedAt,
        price: product.priceByMeasureUnit,
        cost: product.costByMeasureUnit,
      });
    }
    return points;
  }, [priceLogs, product, loadedAt]);

  // Ticks show the time instead of the date when every change is that recent.
  const chartSpan =
    chartData.length > 1
      ? chartData[chartData.length - 1].time - chartData[0].time
      : 0;

  // From the earliest price known (before the first recorded change, if the
  // product existed before the history) to the current one.
  const totalChange = useMemo(() => {
    const oldest = priceLogs[priceLogs.length - 1];
    if (!oldest || !product) return null;
    const firstPrice =
      oldest.previous?.priceByMeasureUnit ?? oldest.current.priceByMeasureUnit;
    return percentChange(firstPrice, product.priceByMeasureUnit);
  }, [priceLogs, product]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Cargando historial de precios...</div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-lg text-destructive">
            {error ?? "ID de producto no proporcionado"}
          </div>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="bigger-icon" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-3 md:gap-5 p-3 md:p-5">
      <aside className="w-full md:w-64 shrink-0">
        <Card className="p-4 gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Tag className="size-3.5" />
              Producto
            </span>
            <h2 className="text-lg font-bold leading-tight break-words">
              {product?.name ?? "—"}
            </h2>
            {product && (
              <p className="text-sm text-muted-foreground">{product.code}</p>
            )}
          </div>

          <Separator />

          {product && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Precio por {product.saleUnitType}
                </p>
                <p className="text-2xl font-bold">
                  {formatMoney(product.priceBySaleUnit)}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Precio por {product.measureType}
                </p>
                <p className="text-2xl font-bold">
                  {formatMoney(product.priceByMeasureUnit)}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Cambios</p>
                <p className="text-2xl font-bold">{priceLogs.length}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Variación total</p>
                <p className="text-2xl font-bold">
                  {formatChange(totalChange) ?? "—"}
                </p>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => navigate(-1)}>
            <ChevronLeft className="bigger-icon" />
            Volver
          </Button>
        </Card>
      </aside>

      <div className="flex-1 min-w-0 min-h-0">
        <Card className="h-full flex flex-col overflow-hidden py-0 gap-0">
          <div className="p-3 border-b shrink-0">
            <h2 className="text-lg font-semibold">
              Historial de precios de "{product?.name ?? "—"}"
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {priceLogs.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Todavía no hay cambios de precio registrados para este producto.
              </p>
            ) : (
              <>
                <div className="p-3 border-b">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-[3/1] min-h-48 w-full"
                  >
                    <LineChart
                      accessibilityLayer
                      data={chartData}
                      margin={{ left: 0, right: 12, top: 8 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="time"
                        type="number"
                        scale="time"
                        domain={["dataMin", "dataMax"]}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tickFormatter={
                          chartSpan < 2 * DAY_MS ? formatTime : formatShortDate
                        }
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={56}
                        domain={["auto", "auto"]}
                        tickFormatter={(v: number) => `$${formatCompact(v)}`}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(_, payload) =>
                              payload?.[0]
                                ? formatDateTime(payload[0].payload.time)
                                : ""
                            }
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        dataKey="price"
                        type="stepAfter"
                        stroke="var(--color-price)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        isAnimationActive={false}
                      />
                      <Line
                        dataKey="cost"
                        type="stepAfter"
                        stroke="var(--color-cost)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead className="text-right">
                        Costo / {measureUnit}
                      </TableHead>
                      <TableHead className="text-right">Margen</TableHead>
                      <TableHead className="text-right">
                        Precio / {measureUnit}
                      </TableHead>
                      <TableHead className="text-right">
                        Precio / {product?.saleUnitType ?? "unidad"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="align-top">
                          <p className="whitespace-nowrap">
                            {formatShortDate(new Date(log.datetime).getTime())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(new Date(log.datetime).getTime())}
                          </p>
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge variant="outline">
                            {SOURCE_LABELS[log.source]}
                          </Badge>
                          {log.detail && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {log.detail}
                            </p>
                          )}
                        </TableCell>
                        <ChangeCell
                          field="costByMeasureUnit"
                          log={log}
                          format={formatMoney}
                        />
                        <ChangeCell
                          field="profit"
                          log={log}
                          format={formatPercent}
                          relative={false}
                        />
                        <ChangeCell
                          field="priceByMeasureUnit"
                          log={log}
                          format={formatMoney}
                        />
                        <ChangeCell
                          field="priceBySaleUnit"
                          log={log}
                          format={formatMoney}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductPriceHistory;
