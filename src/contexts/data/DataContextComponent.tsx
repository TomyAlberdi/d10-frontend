import type {
  BestSellingProductDTO,
  DataContextType,
  MonthlySalesMetrics,
  MonthlySummaryRecord,
  ProductFilter,
  SalesMetricsSummary,
  SortByEnum,
  TimeSpanEnum,
  TopSellingProductDTO,
} from "@/interfaces/DataInterfaces";
import { useCallback, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { DataContext } from "./DataContext";

interface DataContextComponentProps {
  children: ReactNode;
}

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/data`;

/** GET against /data, dropping empty query params. */
const getData = async <T,>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qs = query.toString();
  const response = await fetch(`${API_URL}${path}${qs ? `?${qs}` : ""}`);
  if (!response.ok) {
    toast.error(`Error: ${response.status}`);
    throw new Error(`HTTP Error: ${response.status}`);
  }
  return (await response.json()) as T;
};

const DataContextComponent: React.FC<DataContextComponentProps> = ({
  children,
}) => {
  const getYearlySalesData = useCallback(
    (year: number) =>
      getData<MonthlySummaryRecord[]>(`/yearly-sales/${year}`),
    [],
  );

  const getMonthlySalesMetrics = useCallback(
    (year: number, filter: ProductFilter) =>
      getData<MonthlySalesMetrics[]>("/sales/monthly-metrics", {
        year,
        category: filter.category,
        subcategory: filter.subcategory,
      }),
    [],
  );

  const getSalesMetricsSummary = useCallback(
    (year: number) =>
      getData<SalesMetricsSummary>("/sales/metrics-summary", { year }),
    [],
  );

  const getBestSellingProducts = useCallback(
    (timeSpan: TimeSpanEnum, sortBy: SortByEnum) =>
      getData<BestSellingProductDTO[]>(
        `/best-selling-products/${timeSpan}/${sortBy}`,
      ),
    [],
  );

  const getTop5ByCategory = useCallback(
    (category: string, sortBy: SortByEnum, timespan: TimeSpanEnum) =>
      getData<TopSellingProductDTO[]>("/top-by-category", {
        category,
        sortBy,
        timespan,
      }),
    [],
  );

  const getTop5BySubcategory = useCallback(
    (subcategory: string, sortBy: SortByEnum, timespan: TimeSpanEnum) =>
      getData<TopSellingProductDTO[]>("/top-by-subcategory", {
        subcategory,
        sortBy,
        timespan,
      }),
    [],
  );

  const value: DataContextType = useMemo(
    () => ({
      getYearlySalesData,
      getMonthlySalesMetrics,
      getSalesMetricsSummary,
      getBestSellingProducts,
      getTop5ByCategory,
      getTop5BySubcategory,
    }),
    [
      getYearlySalesData,
      getMonthlySalesMetrics,
      getSalesMetricsSummary,
      getBestSellingProducts,
      getTop5ByCategory,
      getTop5BySubcategory,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContextComponent;
