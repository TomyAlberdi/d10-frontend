import { Card, CardContent } from "@/components/ui/card";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { KpiSummary } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useDataFilters } from "../useDataFilters";

/** Percentage change, null when there is no previous value to compare against. */
const delta = (current: number, previous: number): number | null => {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const Tile = ({
  label,
  value,
  change,
  hint,
}: {
  label: string;
  value: string;
  change?: number | null;
  hint?: string;
}) => (
  <Card>
    <CardContent className="flex flex-col gap-1 py-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
      {change !== null && change !== undefined && (
        <span
          className={
            change >= 0
              ? "text-xs flex items-center gap-1 text-emerald-600"
              : "text-xs flex items-center gap-1 text-red-600"
          }
        >
          {change >= 0 ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {change.toFixed(1)}% vs periodo anterior
        </span>
      )}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </CardContent>
  </Card>
);

const KpiSummaryStrip = () => {
  const { getKpiSummary } = useDataContext();
  const { from, to, basis } = useDataFilters();

  const [Kpi, setKpi] = useState<KpiSummary | null>(null);

  useEffect(() => {
    getKpiSummary(from, to, basis).then(setKpi);
  }, [getKpiSummary, from, to, basis]);

  if (!Kpi) return null;

  return (
    <div className="col-span-4 grid grid-cols-2 md:grid-cols-5 gap-3">
      <Tile
        label="Ingresos"
        value={`$ ${formatPrice(Kpi.revenue)}`}
        change={delta(Kpi.revenue, Kpi.revenuePrevious)}
      />
      <Tile
        label="Ticket Promedio"
        value={`$ ${formatPrice(Kpi.avgTicket)}`}
        change={delta(Kpi.avgTicket, Kpi.avgTicketPrevious)}
        hint={`${Kpi.invoiceCount} ventas`}
      />
      <Tile
        label="Deuda Pendiente"
        value={`$ ${formatPrice(Kpi.outstandingDebt)}`}
        hint={`${Kpi.outstandingInvoiceCount} ventas sin cobrar`}
      />
      <Tile
        label="Valor de Stock"
        value={`$ ${formatPrice(Kpi.stockValueAtCost)}`}
        hint="Al costo, hoy"
      />
      <Tile
        label="Caja Neta"
        value={`$ ${formatPrice(Kpi.netCash)}`}
        hint="Sin caja en dolares"
      />
    </div>
  );
};

export default KpiSummaryStrip;
