import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";

export type InvoiceStatus =
  | "PENDIENTE"
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
  partialPayment?: number;
}

export interface Invoice extends CreateInvoiceDTO {
  id: string;
  invoiceNumber?: string;
  date?: string;
  stockDecreased?: boolean;
}
