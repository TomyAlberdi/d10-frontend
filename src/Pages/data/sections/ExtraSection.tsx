import { useDataContext } from "@/contexts/data/UseDataContext";
import type { SalesMetricsSummary } from "@/interfaces/DataInterfaces";
import {
  Grid2x2,
  Receipt,
  Ruler,
  ShoppingCart,
  Sparkles,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import DataSection from "../components/DataSection";
import StatCard from "../components/StatCard";
import { CURRENT_YEAR, formatM2, formatMoney } from "../components/format";

const ExtraSection = () => {
  const { getSalesMetricsSummary } = useDataContext();
  const [summary, setSummary] = useState<SalesMetricsSummary | null>(null);

  useEffect(() => {
    getSalesMetricsSummary(CURRENT_YEAR).then(setSummary);
  }, [getSalesMetricsSummary]);

  return (
    <DataSection
      title="Resumen del Año"
      description={`Acumulado ${CURRENT_YEAR} hasta hoy`}
      icon={Sparkles}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Ticket promedio ($)"
          icon={Receipt}
          value={summary && formatMoney(summary.avgTicket)}
          hint="Facturación / ventas"
        />
        <StatCard
          label="Ticket promedio (m²)"
          icon={Ruler}
          value={summary && formatM2(summary.avgTicketM2)}
          hint="m² vendidos / ventas con m²"
        />
        <StatCard
          label="Superficie vendida"
          icon={Grid2x2}
          value={summary && formatM2(summary.surfaceM2)}
          hint={summary ? `${summary.m2InvoiceCount} ventas con m²` : undefined}
        />
        <StatCard
          label="Precio promedio por m²"
          icon={Tag}
          value={summary && formatMoney(summary.avgPricePerM2)}
          hint="Facturación m² / m² vendidos"
        />
        <StatCard
          label="Ventas realizadas"
          icon={ShoppingCart}
          value={summary && summary.invoiceCount.toLocaleString("es-ES")}
          hint={
            summary ? `${formatMoney(summary.revenue)} facturados` : undefined
          }
        />
      </div>
    </DataSection>
  );
};
export default ExtraSection;
