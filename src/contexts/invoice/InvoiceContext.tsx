import type {
    CreateInvoiceDTO,
    Invoice,
    InvoiceStatus,
} from "@/interfaces/InvoiceInterfaces";
import { createContext } from "react";

export interface InvoiceContextType {
  createInvoice: (dto: CreateInvoiceDTO) => Promise<Invoice>;
  getInvoiceById: (id: string) => Promise<Invoice | null>;
  updateInvoice: (id: string, dto: CreateInvoiceDTO) => Promise<Invoice>;
  deleteInvoiceById: (id: string) => Promise<void>;
  searchInvoices: (q: string, status?: InvoiceStatus) => Promise<Invoice[]>;
  getRecentInvoices: (status?: InvoiceStatus) => Promise<Invoice[]>;
  getInvoicesWithStockNotDecreased: () => Promise<Invoice[]>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  getInvoicesByProductId: (productId: string) => Promise<Invoice[]>;
}

export const InvoiceContext = createContext<InvoiceContextType | null>(null);
