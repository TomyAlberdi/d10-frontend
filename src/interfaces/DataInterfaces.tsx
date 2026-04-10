export interface MonthlySummaryRecord {
  month: number;
  year: number;
  income: number;
  // filled data
  monthName?: string;
}

export interface DataContextType {
  getYearlySalesData: (year: number) => Promise<MonthlySummaryRecord[]>;
}
