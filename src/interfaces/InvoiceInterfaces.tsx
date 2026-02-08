import type { Client } from "@/interfaces/ClientInterfaces";
import type { CartProduct } from "@/interfaces/CartInterfaces";

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
}

export interface Invoice extends CreateInvoiceDTO {
  id: string;
  date: string;
}
