import { useDataContext } from "@/contexts/data/UseDataContext";
import type {
  MonthlySalesMetrics,
  ProductFilter,
} from "@/interfaces/DataInterfaces";
import { useEffect, useState } from "react";
import MetricAreaChart from "../components/MetricAreaChart";
import ProductFilterSelect from "../components/ProductFilterSelect";
import { CURRENT_YEAR, formatMoney, toChartRows } from "../components/format";

/**
 * Average ticket in $ (revenue / number of sales) per month. Filtered by
 * category, revenue is the subtotal of the matching lines only.
 */
const AverageTicketChart = () => {
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

  const revenue = rows?.reduce((acc, r) => acc + r.revenue, 0) ?? 0;
  const sales = rows?.reduce((acc, r) => acc + r.invoiceCount, 0) ?? 0;

  return (
    <MetricAreaChart
      title="Ticket Promedio ($)"
      description={`Facturación / cantidad de ventas · ${CURRENT_YEAR}`}
      data={
        rows &&
        toChartRows(rows, [{ key: "avgTicket", denominator: "invoiceCount" }])
      }
      dataKey="avgTicket"
      label="Ticket promedio"
      color="var(--chart-1)"
      valueFormatter={formatMoney}
      action={<ProductFilterSelect value={filter} onChange={setFilter} />}
      footer={
        rows && (
          <span>
            Promedio del año:{" "}
            <b className="text-foreground">
              {formatMoney(sales ? revenue / sales : 0)}
            </b>{" "}
            · {sales} ventas
          </span>
        )
      }
    />
  );
};
export default AverageTicketChart;
