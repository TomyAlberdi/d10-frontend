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

export interface DataContextType {
  getYearlySalesData: (year: number) => Promise<MonthlySummaryRecord[]>;
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
