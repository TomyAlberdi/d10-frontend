export type CashRegisterType = "PAPER" | "DIGITAL" | "USD";

export type CashRegisterTransactionType = "IN" | "OUT";

export interface CashRegisterDTO {
  currentAmount: number;
  type: CashRegisterType;
}

export interface CreateCashRegisterTransactionDTO {
  amount: number;
  type: CashRegisterTransactionType;
  description?: string;
  registerType: CashRegisterType;
}

export interface CashRegisterTransaction {
  id: string;
  amount: number;
  type: CashRegisterTransactionType;
  description?: string;
  dateTime: string; // ISO string from backend
  registerType: CashRegisterType;
  /** The sale this transaction collects or refunds, absent for manual ones. */
  invoiceId?: string;
  invoiceNumber?: string;
}

export interface CashRegisterDailyTotals {
  inTotal: number;
  outTotal: number;
}

export interface CashRegisterTransactionPageResponse {
  content: CashRegisterTransaction[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PaginatedTransactionsState {
  transactions: CashRegisterTransaction[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
}

export interface CashRegisterContextType {
  /** Current amount of cash in the paper register. */
  paperAmount: number;
  /** Current amount of cash in the digital register. */
  digitalAmount: number;
  /** Current amount of cash in the USD register. */
  usdAmount: number;
  /** Whether the amounts are being loaded. */
  isLoadingAmount: boolean;
  /** Transactions list. */
  transactions: CashRegisterTransaction[];
  /** Whether transactions are being loaded. */
  isLoadingTransactions: boolean;
  /** Selected cash register type */
  selectedType: CashRegisterType;
  /** Set selected type */
  setSelectedType: (type: CashRegisterType) => void;
  /**
   * Totals for the currently selected date.
   */
  dailyTotals: CashRegisterDailyTotals;
  /**
   * Whether daily totals are being loaded.
   */
  isLoadingDailyTotals: boolean;
  /**
   * Fetch the current amounts from the backend.
   */
  fetchCurrentAmounts: () => Promise<void>;
  /**
   * Add cash to the register (e.g. manual correction, opening cash, etc.).
   */
  addCash: (amount: number, description?: string) => Promise<void>;
  /**
   * Remove cash from the register (e.g. withdrawals, expenses, etc.).
   */
  removeCash: (amount: number, description?: string) => Promise<void>;
  /**
   * Fetch transactions, optionally filtered by date (ISO date string YYYY-MM-DD).
   */
  fetchTransactions: (date?: string) => Promise<void>;
  /**
   * Fetch aggregated in/out totals for a given date.
   */
  fetchDailyTotals: (date?: string) => Promise<void>;
  /**
   * Update an existing transaction.
   */
  updateTransaction: (
    id: string,
    dto: CreateCashRegisterTransactionDTO,
  ) => Promise<CashRegisterTransaction>;
  /**
   * Delete a transaction.
   */
  deleteTransaction: (id: string) => Promise<void>;
  /**
   * Transactions linked to a sale, oldest first.
   */
  getInvoiceTransactions: (
    invoiceId: string,
  ) => Promise<CashRegisterTransaction[]>;
  /**
   * Paginated transactions list.
   */
  paginatedTransactions: CashRegisterTransaction[];
  /**
   * Current page in paginated view.
   */
  paginatedCurrentPage: number;
  /**
   * Total pages available.
   */
  paginatedTotalPages: number;
  /**
   * Total elements available.
   */
  paginatedTotalElements: number;
  /**
   * Whether paginated transactions are being loaded.
   */
  isPaginatedLoading: boolean;
  /**
   * Fetch paginated transactions without date filtering.
   * Appends to existing transactions list.
   * `type` and `direction` default to the active filter state
   * (`paginatedRegisterTypeFilter` / `paginatedDirectionFilter`) when omitted;
   * pass `null` explicitly to clear a filter for that call.
   */
  fetchTransactionsPaginated: (
    page?: number,
    type?: CashRegisterType | null,
    direction?: CashRegisterTransactionType | null,
  ) => Promise<void>;
  /**
   * Reset paginated transactions state.
   */
  resetPaginatedTransactions: () => void;
  /**
   * Active register type (CASH/DIGITAL/USD) filter for the paginated list.
   */
  paginatedRegisterTypeFilter: CashRegisterType | null;
  /**
   * Set the register type filter for the paginated list.
   */
  setPaginatedRegisterTypeFilter: (type: CashRegisterType | null) => void;
  /**
   * Active direction (IN/OUT) filter for the paginated list.
   */
  paginatedDirectionFilter: CashRegisterTransactionType | null;
  /**
   * Set the direction filter for the paginated list.
   */
  setPaginatedDirectionFilter: (
    direction: CashRegisterTransactionType | null,
  ) => void;
}
