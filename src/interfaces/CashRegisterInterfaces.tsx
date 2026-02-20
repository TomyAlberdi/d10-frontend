import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";

export type CashRegisterType = "PAPER" | "DIGITAL";

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
}

export interface CashRegisterStatusChangePayload {
  clientName?: string;
  invoiceId?: string;
  previousStatus: InvoiceStatus | null;
  nextStatus: InvoiceStatus;
  total: number;
  paymentMethod?: "CASH" | "DIGITAL";
  /**
   * Whether the invoice had `stockDecreased` set to true
   * in the first version we received from the backend.
   */
  stockDecreasedInitially?: boolean;
}

export interface CashRegisterContextType {
  /** Current amount of cash in the paper register. */
  paperAmount: number;
  /** Current amount of cash in the digital register. */
  digitalAmount: number;
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
