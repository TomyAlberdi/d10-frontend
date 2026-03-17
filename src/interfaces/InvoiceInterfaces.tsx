import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";

export type InvoiceStatus =
  | "PENDIENTE"
  | "PAGO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export type PaymentMethod = "CASH" | "DIGITAL";

export interface CreateInvoiceDTO {
  client: Client;
  products: CartProduct[];
  status: InvoiceStatus;
  discount: number;
  total: number;
  notes?: string; // optional annotation for invoice notes
  partialPayment?: number;
  paymentMethod?: PaymentMethod;
  stockDecreased?: boolean;
}

export interface Invoice extends CreateInvoiceDTO {
  id: string;
  invoiceNumber?: string;
  date?: string;
}
