import type { Product } from "./ProductInterfaces";

export type TimeSpanEnum = "LAST_MONTH" | "LAST_YEAR" | "ALL_TIME";
export type SortByEnum = "SALES_AMOUNT" | "GROSS_INCOME" | "NET_INCOME";

export interface MonthlySummaryRecord {
  month: number;
  year: number;
  income: number;
  // filled data
  monthName?: string;
}

export interface BestSellingProductDTO {
  product: Product;
  salesAmount: number;
  totalSurface: number;
  totalIncome: number;
  netIncome: number | null;
}

export interface DataContextType {
  getYearlySalesData: (year: number) => Promise<MonthlySummaryRecord[]>;
  getBestSellingProducts: (
    timeSpan: TimeSpanEnum,
    sortBy: SortByEnum
  ) => Promise<BestSellingProductDTO[]>;
}
