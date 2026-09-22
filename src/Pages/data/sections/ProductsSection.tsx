import { useDataContext } from "@/contexts/data/UseDataContext";
import type {
  MonthlySalesMetrics,
  ProductFilter,
} from "@/interfaces/DataInterfaces";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import BestSellingProducts from "../charts/BestSellingProducts";
import DataSection from "../components/DataSection";
import MetricAreaChart from "../components/MetricAreaChart";
import ProductFilterSelect from "../components/ProductFilterSelect";
import {
  CURRENT_YEAR,
  formatM2,
  formatMoney,
  toChartRows,
} from "../components/format";

/**
 * The m2 charts share one filter and one request, so the ticket and the
 * price per m2 always describe the same slice of the catalog.
 */
const ProductsSection = () => {
  const { getMonthlySalesMetrics } = useDataContext();
  const [filter, setFilter] = useState<ProductFilter>({});
  const [rows, setRows] = useState<MonthlySalesMetrics[] | null>(null);

  useEffect(() => {
    let ignore = false;
    setRows(null);
    getMonthlySalesMetrics(CURRENT_YEAR, filter).then((data) => {
      if (!ignore) setRows(data);
    });
    return () => {
      ignore = true;
    };
  }, [getMonthlySalesMetrics, filter]);

  const chartRows =
    rows &&
    toChartRows(rows, [
      { key: "avgTicketM2", denominator: "m2InvoiceCount" },
      { key: "avgPricePerM2", denominator: "surfaceM2" },
    ]);

  const surface = rows?.reduce((acc, r) => acc + r.surfaceM2, 0) ?? 0;
  const m2Sales = rows?.reduce((acc, r) => acc + r.m2InvoiceCount, 0) ?? 0;
  const m2Revenue = rows?.reduce((acc, r) => acc + r.m2Revenue, 0) ?? 0;

  const filterLabel =
    filter.subcategory ?? filter.category ?? "Todos los productos";

  return (
    <DataSection
      title="Productos"
      description={`Métricas por m² · ${filterLabel}`}
      icon={Package}
      actions={<ProductFilterSelect value={filter} onChange={setFilter} />}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <MetricAreaChart
          title="Ticket Promedio (m²)"
          description={`m² vendidos / ventas con m² · ${CURRENT_YEAR}`}
          data={chartRows}
          dataKey="avgTicketM2"
          label="Ticket promedio"
          color="var(--chart-2)"
          valueFormatter={formatM2}
          footer={
            rows && (
              <span>
                Promedio del año:{" "}
                <b className="text-foreground">
                  {formatM2(m2Sales ? surface / m2Sales : 0)}
                </b>{" "}
                · {m2Sales} ventas con m²
              </span>
            )
          }
        />
        <MetricAreaChart
          title="Precio Promedio por m²"
          description={`Facturación m² / m² vendidos · ${CURRENT_YEAR}`}
          data={chartRows}
          dataKey="avgPricePerM2"
          label="Precio por m²"
          color="var(--chart-3)"
          valueFormatter={formatMoney}
          footer={
            rows && (
              <span>
                Promedio del año:{" "}
                <b className="text-foreground">
                  {formatMoney(surface ? m2Revenue / surface : 0)}
                </b>{" "}
                · {formatM2(surface)} vendidos
              </span>
            )
          }
        />
      </div>
      <BestSellingProducts />
    </DataSection>
  );
};
export default ProductsSection;
