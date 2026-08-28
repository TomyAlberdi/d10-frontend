import type { Product } from "./ProductInterfaces";

export type TimeSpanEnum = "THIS_MONTH" | "THIS_YEAR" | "ALL_TIME";

/**
 * INVOICE_COUNT and UNITS_SOLD used to be a single SALES_AMOUNT that meant
 * "number of invoices" in one endpoint and "sale units" in the other.
 */
export type SortByEnum =
  | "INVOICE_COUNT"
  | "UNITS_SOLD"
  | "GROSS_INCOME"
  | "NET_INCOME";

/**
 * Which invoice statuses count as revenue.
 * COLLECTED = money taken · DELIVERED = adds DEUDA · QUOTED = adds PENDIENTE.
 */
export type RevenueBasis = "COLLECTED" | "DELIVERED" | "QUOTED";

export type CashRegisterType = "PAPER" | "DIGITAL" | "USD";

export type ClientType = "CONSUMIDOR_FINAL" | "RESPONSABLE_INSCRIPTO";

export type CategoryLevel = "CATEGORY" | "SUBCATEGORY";

export type StockGroupBy = "CATEGORY" | "SUBCATEGORY" | "PROVIDER" | "QUALITY";

export interface MonthlySummaryRecord {
  month: number;
  year: number;
  income: number;
  // filled data
  monthName?: string;
}

export interface AvailableYear {
  year: number;
  invoiceCount: number;
}

/** A0 — headline figures, each against the preceding period of equal length. */
export interface KpiSummary {
  revenue: number;
  revenuePrevious: number;
  avgTicket: number;
  avgTicketPrevious: number;
  invoiceCount: number;
  invoiceCountPrevious: number;
  outstandingDebt: number;
  outstandingInvoiceCount: number;
  stockValueAtCost: number;
  netCash: number;
}

/** A1 — one row per year and month. */
export interface MonthlySalesRecord {
  year: number;
  month: number;
  income: number;
  invoiceCount: number;
  unitsSold: number;
  surfaceSold: number;
  avgTicket: number;
}

/** A3 — revenue share of a category or subcategory. */
export interface CategoryRevenueRecord {
  key: string;
  revenue: number;
  unitsSold: number;
  skuCount: number;
  sharePct: number;
}

/** A5 — `unspecified` holds invoices issued before the field existed. */
export interface PaymentMethodRecord {
  year: number;
  month: number;
  cash: number;
  digital: number;
  usd: number;
  unspecified: number;
  total: number;
  // filled data
  monthName?: string;
}

/** B1 — outstanding balance by age in days. */
export interface ReceivableBucket {
  bucket: string;
  invoiceCount: number;
  outstanding: number;
  oldestDays: number;
}

/** B2 — who owes what. */
export interface Debtor {
  clientId: string | null;
  clientName: string;
  outstanding: number;
  totalInvoiced: number;
  paidPct: number;
  invoiceCount: number;
  oldestInvoiceDays: number;
}

export interface MonthlyCashFlowRecord {
  month: number;
  year: number;
  inTotal: number;
  outTotal: number;
  net: number;
  // filled data
  monthName?: string;
}

export interface TopClientRecord {
  clientId: string | null;
  clientName: string;
  clientType: ClientType | null;
  revenue: number;
  invoiceCount: number;
  avgTicket: number;
  lastPurchase: string | null;
}

/** C1 — stock valued at cost and at list price. */
export interface StockValuationRecord {
  key: string;
  skuCount: number;
  unitsOnHand: number;
  costValue: number;
  retailValue: number;
  potentialMargin: number;
  sharePct: number;
}

/** C2 — `turns` and `daysOfSupply` are null when they cannot be computed. */
export interface StockTurnoverRecord {
  productId: string;
  code: string;
  name: string;
  category: string | null;
  providerName: string | null;
  unitsOut: number;
  unitsOnHand: number;
  turns: number | null;
  daysOfSupply: number | null;
  costValue: number;
}

/** C3 — a product holding stock that has not moved. */
export interface DeadStockItem {
  productId: string;
  code: string;
  name: string;
  category: string | null;
  providerName: string | null;
  unitsOnHand: number;
  costValue: number;
  lastMovement: string | null;
  daysIdle: number | null;
}

export interface DeadStock {
  totalCostValue: number;
  itemCount: number;
  items: DeadStockItem[];
}

/** E1 — margin fields are null when any product of the supplier has no cost. */
export interface ProviderPerformanceRecord {
  providerName: string;
  revenue: number;
  cost: number | null;
  margin: number | null;
  marginPct: number | null;
  unitsSold: number;
  skuCount: number;
  stockValue: number;
  costBasisEstimated: boolean;
}

/** F3 — how much of the catalog is missing the fields other charts rely on. */
export interface CatalogQuality {
  total: number;
  active: number;
  discontinued: number;
  withStock: number;
  missingCost: number;
  missingPrice: number;
  missingCategory: number;
  missingSubcategory: number;
  missingImages: number;
  missingCharacteristics: number;
  missingDimensions: number;
  missingProvider: number;
}

export interface BestSellingProductDTO {
  product: Product;
  invoiceCount: number;
  unitsSold: number;
  totalSurface: number;
  totalIncome: number;
  netIncome: number | null;
  /** True when part of the cost came from the current product cost, not from a snapshot. */
  costBasisEstimated: boolean;
}

export interface TopSellingProductDTO {
  product: Product;
  invoiceCount: number;
  unitsSold: number;
  totalIncome: number;
  netIncome: number | null;
  costBasisEstimated: boolean;
  timespan: TimeSpanEnum;
}

export interface DataContextType {
  getAvailableYears: () => Promise<AvailableYear[]>;
  getKpiSummary: (
    from?: string,
    to?: string,
    basis?: RevenueBasis,
  ) => Promise<KpiSummary>;
  getYearlySalesData: (
    year: number,
    basis?: RevenueBasis,
  ) => Promise<MonthlySummaryRecord[]>;
  getMonthlySales: (
    years: number[],
    basis?: RevenueBasis,
  ) => Promise<MonthlySalesRecord[]>;
  getRevenueByCategory: (
    from?: string,
    to?: string,
    level?: CategoryLevel,
    basis?: RevenueBasis,
  ) => Promise<CategoryRevenueRecord[]>;
  getRevenueByPaymentMethod: (
    year: number,
    basis?: RevenueBasis,
  ) => Promise<PaymentMethodRecord[]>;
  getBestSellingProducts: (
    timeSpan: TimeSpanEnum,
    sortBy: SortByEnum,
    basis?: RevenueBasis,
  ) => Promise<BestSellingProductDTO[]>;
  getTop5ByCategory: (
    category: string,
    sortBy: SortByEnum,
    timespan: TimeSpanEnum,
    basis?: RevenueBasis,
  ) => Promise<TopSellingProductDTO[]>;
  getTop5BySubcategory: (
    subcategory: string,
    sortBy: SortByEnum,
    timespan: TimeSpanEnum,
    basis?: RevenueBasis,
  ) => Promise<TopSellingProductDTO[]>;
  getReceivablesAging: () => Promise<ReceivableBucket[]>;
  getTopDebtors: (limit?: number) => Promise<Debtor[]>;
  getMonthlyCashFlow: (
    year: number,
    registerType?: CashRegisterType,
  ) => Promise<MonthlyCashFlowRecord[]>;
  getTopClients: (
    from?: string,
    to?: string,
    limit?: number,
    basis?: RevenueBasis,
  ) => Promise<TopClientRecord[]>;
  getProviderPerformance: (
    from?: string,
    to?: string,
    basis?: RevenueBasis,
  ) => Promise<ProviderPerformanceRecord[]>;
  getStockValuation: (
    groupBy?: StockGroupBy,
  ) => Promise<StockValuationRecord[]>;
  getStockTurnover: (
    from?: string,
    to?: string,
    limit?: number,
  ) => Promise<StockTurnoverRecord[]>;
  getDeadStock: (daysWithoutSale?: number) => Promise<DeadStock>;
  getCatalogQuality: () => Promise<CatalogQuality>;
}
