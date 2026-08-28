import type {
  AvailableYear,
  BestSellingProductDTO,
  CashRegisterType,
  CatalogQuality,
  CategoryLevel,
  CategoryRevenueRecord,
  DataContextType,
  DeadStock,
  Debtor,
  KpiSummary,
  MonthlyCashFlowRecord,
  MonthlySalesRecord,
  MonthlySummaryRecord,
  PaymentMethodRecord,
  ProviderPerformanceRecord,
  ReceivableBucket,
  RevenueBasis,
  SortByEnum,
  StockGroupBy,
  StockTurnoverRecord,
  StockValuationRecord,
  TimeSpanEnum,
  TopClientRecord,
  TopSellingProductDTO,
} from "@/interfaces/DataInterfaces";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { DataContext } from "./DataContext";

interface DataContextComponentProps {
  children: ReactNode;
}

const DataContextComponent: React.FC<DataContextComponentProps> = ({
  children,
}) => {
  const API_URL = `${import.meta.env.VITE_BASE_API_URL}/data`;

  /**
   * Single fetch helper: builds the query string, reports the failure once and
   * returns the parsed body. Params with an empty value are left out.
   */
  const request = useCallback(
    async <T,>(
      path: string,
      params?: Record<string, string | number | undefined>,
    ): Promise<T> => {
      const query = new URLSearchParams();
      Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
      const queryString = query.toString();
      const url = `${API_URL}${path}${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        toast.error(`Error: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return (await response.json()) as T;
    },
    [API_URL],
  );

  // ------------------------------------------------------------- sales

  const getAvailableYears = useCallback(
    () => request<AvailableYear[]>("/available-years"),
    [request],
  );

  const getKpiSummary = useCallback(
    (from?: string, to?: string, basis?: RevenueBasis) =>
      request<KpiSummary>("/kpi/summary", { from, to, basis }),
    [request],
  );

  const getYearlySalesData = useCallback(
    (year: number, basis?: RevenueBasis) =>
      request<MonthlySummaryRecord[]>(`/yearly-sales/${year}`, { basis }),
    [request],
  );

  const getMonthlySales = useCallback(
    (years: number[], basis?: RevenueBasis) =>
      request<MonthlySalesRecord[]>("/sales/monthly", {
        years: years.join(","),
        basis,
      }),
    [request],
  );

  const getRevenueByCategory = useCallback(
    (
      from?: string,
      to?: string,
      level?: CategoryLevel,
      basis?: RevenueBasis,
    ) =>
      request<CategoryRevenueRecord[]>("/revenue/by-category", {
        from,
        to,
        level,
        basis,
      }),
    [request],
  );

  const getRevenueByPaymentMethod = useCallback(
    (year: number, basis?: RevenueBasis) =>
      request<PaymentMethodRecord[]>("/revenue/by-payment-method", {
        year,
        basis,
      }),
    [request],
  );

  // --------------------------------------------------- product rankings

  const getBestSellingProducts = useCallback(
    (timeSpan: TimeSpanEnum, sortBy: SortByEnum, basis?: RevenueBasis) =>
      request<BestSellingProductDTO[]>(
        `/best-selling-products/${timeSpan}/${sortBy}`,
        { basis },
      ),
    [request],
  );

  const getTop5ByCategory = useCallback(
    (
      category: string,
      sortBy: SortByEnum,
      timespan: TimeSpanEnum,
      basis?: RevenueBasis,
    ) =>
      request<TopSellingProductDTO[]>("/top-by-category", {
        category,
        sortBy,
        timespan,
        basis,
      }),
    [request],
  );

  const getTop5BySubcategory = useCallback(
    (
      subcategory: string,
      sortBy: SortByEnum,
      timespan: TimeSpanEnum,
      basis?: RevenueBasis,
    ) =>
      request<TopSellingProductDTO[]>("/top-by-subcategory", {
        subcategory,
        sortBy,
        timespan,
        basis,
      }),
    [request],
  );

  // ------------------------------------------------- receivables & cash

  const getReceivablesAging = useCallback(
    () => request<ReceivableBucket[]>("/receivables/aging"),
    [request],
  );

  const getTopDebtors = useCallback(
    (limit?: number) =>
      request<Debtor[]>("/receivables/top-clients", { limit }),
    [request],
  );

  const getMonthlyCashFlow = useCallback(
    (year: number, registerType?: CashRegisterType) =>
      request<MonthlyCashFlowRecord[]>("/cash-flow/monthly", {
        year,
        registerType,
      }),
    [request],
  );

  const getTopClients = useCallback(
    (from?: string, to?: string, limit?: number, basis?: RevenueBasis) =>
      request<TopClientRecord[]>("/clients/top", { from, to, limit, basis }),
    [request],
  );

  // ------------------------------------------------- suppliers & stock

  const getProviderPerformance = useCallback(
    (from?: string, to?: string, basis?: RevenueBasis) =>
      request<ProviderPerformanceRecord[]>("/providers/performance", {
        from,
        to,
        basis,
      }),
    [request],
  );

  const getStockValuation = useCallback(
    (groupBy?: StockGroupBy) =>
      request<StockValuationRecord[]>("/stock/valuation", { groupBy }),
    [request],
  );

  const getStockTurnover = useCallback(
    (from?: string, to?: string, limit?: number) =>
      request<StockTurnoverRecord[]>("/stock/turnover", { from, to, limit }),
    [request],
  );

  const getDeadStock = useCallback(
    (daysWithoutSale?: number) =>
      request<DeadStock>("/stock/dead", { daysWithoutSale }),
    [request],
  );

  const getCatalogQuality = useCallback(
    () => request<CatalogQuality>("/catalog/quality"),
    [request],
  );

  const value: DataContextType = {
    getAvailableYears,
    getKpiSummary,
    getYearlySalesData,
    getMonthlySales,
    getRevenueByCategory,
    getRevenueByPaymentMethod,
    getBestSellingProducts,
    getTop5ByCategory,
    getTop5BySubcategory,
    getReceivablesAging,
    getTopDebtors,
    getMonthlyCashFlow,
    getTopClients,
    getProviderPerformance,
    getStockValuation,
    getStockTurnover,
    getDeadStock,
    getCatalogQuality,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContextComponent;
