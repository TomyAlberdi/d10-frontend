import type { PaginatedResult, Product } from "@/interfaces/ProductInterfaces";

export type StockLogType = "IN" | "OUT";

export interface StockLog {
  id: string;
  productName: string;
  productId: string;
  saleUnitQuantity: number;
  saleUnitType: Product["saleUnitType"];
  measureUnitQuantity: number;
  measureUnitType: Product["measureType"];
  type: StockLogType;
  /** ISO date-time string coming from the backend. */
  datetime: string;
  detail?: string;
}

export interface CreateStockLogDTO {
  productId: string;
  saleUnitQuantity: number;
  type: StockLogType;
  detail?: string;
  /** Optional, the backend defaults to the current date and time. */
  datetime?: string;
}

export type StockLogPage = PaginatedResult<StockLog>;

export interface StockLogContextType {
  /** Stock logs of the page currently being displayed. */
  stockLogs: StockLog[];
  /** Amount of stock logs requested per page. */
  pageSize: number;
  /** Current page index (0 based). */
  currentPage: number;
  /** Total pages available for the active filter. */
  totalPages: number;
  /** Total stock logs available for the active filter. */
  totalElements: number;
  /** Whether the stock logs are being loaded. */
  isLoading: boolean;
  /** Active IN/OUT filter, `null` means every movement. */
  typeFilter: StockLogType | null;
  /** Change the active IN/OUT filter and reload the first page. */
  setTypeFilter: (type: StockLogType | null) => void;
  /**
   * Fetch a page of stock logs. Defaults to the active filter when the type
   * argument is omitted.
   */
  fetchStockLogs: (page?: number, type?: StockLogType | null) => Promise<void>;
  /** Every stock movement of a single product, most recent first. */
  getStockLogsByProduct: (productId: string) => Promise<StockLog[]>;
  /** Register a stock movement manually. */
  createStockLog: (dto: CreateStockLogDTO) => Promise<void>;
  /** Delete a stock movement. */
  deleteStockLog: (id: string) => Promise<void>;
}
