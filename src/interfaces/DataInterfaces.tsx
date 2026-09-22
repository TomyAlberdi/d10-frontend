import type { Product } from "./ProductInterfaces";

export type TimeSpanEnum = "THIS_MONTH" | "THIS_YEAR" | "ALL_TIME";
export type SortByEnum = "UNITS_SOLD" | "GROSS_INCOME" | "NET_INCOME";

export interface MonthlySummaryRecord {
  month: number;
  year: number;
  /** Everything the month collected: settledIncome + debtPayments. */
  income: number;
  /** Invoices whose payment covered the total. */
  settledIncome: number;
  /** Money already paid on invoices that are still a debt. */
  debtPayments: number;
  // filled data
  monthName?: string;
}

export interface BestSellingProductDTO {
  product: Product;
  unitsSold: number;
  invoiceCount: number;
  totalSurface: number;
  totalIncome: number;
  netIncome: number | null;
  costBasisEstimated: boolean;
}

export interface TopSellingProductDTO {
  product: Product;
  unitsSold: number;
  totalIncome: number;
  timespan: TimeSpanEnum;
}

/**
 * Optional product filter for the ticket / m2 charts. Both fields empty
 * means the whole catalog; with both, a product must match both.
 */
export interface ProductFilter {
  category?: string;
  subcategory?: string;
}

/** One month of the ticket and m2 metrics (GET /data/sales/monthly-metrics). */
export interface MonthlySalesMetrics {
  year: number;
  month: number;
  /** Sales carrying at least one line that matches the filter. */
  invoiceCount: number;
  /** Invoice totals unfiltered; matching line subtotals when filtered. */
  revenue: number;
  /** revenue / invoiceCount */
  avgTicket: number;
  /** Sales carrying at least one m2 line that matches the filter. */
  m2InvoiceCount: number;
  surfaceM2: number;
  /** Subtotals of the m2 lines only. */
  m2Revenue: number;
  /** surfaceM2 / m2InvoiceCount */
  avgTicketM2: number;
  /** m2Revenue / surfaceM2 */
  avgPricePerM2: number;
  // filled data
  monthName?: string;
}

/** The same metrics over a whole year, year to date for the current one. */
export type SalesMetricsSummary = Omit<MonthlySalesMetrics, "month" | "monthName">;

export interface DataContextType {
  getYearlySalesData: (year: number) => Promise<MonthlySummaryRecord[]>;
  getMonthlySalesMetrics: (
    year: number,
    filter: ProductFilter,
  ) => Promise<MonthlySalesMetrics[]>;
  getSalesMetricsSummary: (year: number) => Promise<SalesMetricsSummary>;
  getBestSellingProducts: (
    timeSpan: TimeSpanEnum,
    sortBy: SortByEnum,
  ) => Promise<BestSellingProductDTO[]>;
  getTop5ByCategory: (
    category: string,
    sortBy: SortByEnum,
    timespan: TimeSpanEnum,
  ) => Promise<TopSellingProductDTO[]>;
  getTop5BySubcategory: (
    subcategory: string,
    sortBy: SortByEnum,
    timespan: TimeSpanEnum,
  ) => Promise<TopSellingProductDTO[]>;
}
