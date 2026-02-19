import type { Client } from "@/interfaces/ClientInterfaces";
import type { CartProduct } from "@/interfaces/CartInterfaces";

export type InvoiceStatus =
  | "PENDIENTE"
  | "PAGO_PARCIAL"
  | "PAGO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export interface CreateInvoiceDTO {
  client: Client;
  products: CartProduct[];
  status: InvoiceStatus;
  discount: number;
  total: number;
  paidAmount?: number;
}

export interface InvoicePayment {
  id?: string;
  amount: number;
  date?: string;
}

export interface Invoice extends CreateInvoiceDTO {
  id: string;
  date?: string;
  stockDecreased?: boolean;
  remainingAmount?: number;
  payments?: InvoicePayment[];
}
