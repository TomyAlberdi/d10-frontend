import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { CashRegisterType } from "@/interfaces/CashRegisterInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";

export type InvoiceStatus =
  | "PENDIENTE"
  | "PAGO"
  | "DEUDA"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export type PaymentMethod = "CASH" | "DIGITAL" | "USD";

/**
 * Money received with a save, registered in the cash register and linked to
 * the sale by the backend in the same request.
 */
export interface InvoicePaymentDTO {
  /** What goes into the register, in that register's currency. */
  amount: number;
  registerType: CashRegisterType;
  /** False settles the sale even when `amount` is below what is owed. */
  partial: boolean;
  /** For a partial USD payment: the pesos it covers. */
  pesoAmount?: number;
}

export interface CreateInvoiceDTO {
  /** Null for a sale made without a client ("Consumidor Final"). */
  client: Client | null;
  products: CartProduct[];
  status: InvoiceStatus;
  discount: number;
  total: number;
  notes?: string; // optional annotation for invoice notes
  partialPayment?: number;
  paymentMethod?: PaymentMethod;
  stockDecreased?: boolean;
  /** Amount discounted from `total` because the client had a positive balance. */
  balanceApplied?: number;
  payment?: InvoicePaymentDTO;
  /** On cancelling: give back in the cash register what the sale collected. */
  refundPayments?: boolean;
}

export interface Invoice extends CreateInvoiceDTO {
  id: string;
  invoiceNumber?: string;
  date?: string;
}
