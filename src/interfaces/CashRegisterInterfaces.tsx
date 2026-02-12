import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";

export type CashRegisterTransactionType = "IN" | "OUT";

export interface CashRegisterDTO {
  currentAmount: number;
}

export interface CreateCashRegisterTransactionDTO {
  amount: number;
  type: CashRegisterTransactionType;
  description?: string;
}

export interface CashRegisterTransaction {
  id: string;
  amount: number;
  type: CashRegisterTransactionType;
  description?: string;
  createdAt: string; // ISO string from backend
}

export interface CashRegisterStatusChangePayload {
  invoiceId?: string;
  previousStatus: InvoiceStatus | null;
  nextStatus: InvoiceStatus;
  total: number;
  /**
   * Whether the invoice had `stockDecreased` set to true
   * in the first version we received from the backend.
   */
  stockDecreasedInitially?: boolean;
}

export interface CashRegisterContextType {
  /** Current amount of cash in the register. */
  currentAmount: number;
  /** Whether the current amount is being loaded. */
  isLoadingAmount: boolean;
  /** Transactions list. */
  transactions: CashRegisterTransaction[];
  /** Whether transactions are being loaded. */
  isLoadingTransactions: boolean;
  /**
   * Fetch the current amount from the backend.
   */
  fetchCurrentAmount: () => Promise<void>;
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
   * Update an existing transaction.
   */
  updateTransaction: (
    id: string,
    dto: CreateCashRegisterTransactionDTO,
  ) => Promise<void>;
  /**
   * Delete a transaction.
   */
  deleteTransaction: (id: string) => Promise<void>;
  /**
   * Apply the business rule for an invoice status change:
   * - If the new status is PAGO, ENVIADO or ENTREGADO
   * - AND stockDecreased was not initially true
   * - AND the invoice was not already in one of those statuses
   * then the invoice final total is added to the register via a transaction.
   */
  applyInvoiceStatusChange: (
    payload: CashRegisterStatusChangePayload,
  ) => Promise<void>;
}

