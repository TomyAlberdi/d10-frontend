import type {
  CreateInvoiceDTO,
  Invoice,
  InvoiceStatus,
} from "@/interfaces/InvoiceInterfaces";
import { createContext } from "react";

export interface InvoiceContextType {
  createInvoice: (dto: CreateInvoiceDTO) => Promise<void>;
  getInvoiceById: (id: string) => Promise<Invoice | null>;
  updateInvoice: (id: string, dto: CreateInvoiceDTO) => Promise<void>;
  deleteInvoiceById: (id: string) => Promise<void>;
  searchInvoices: (q: string) => Promise<Invoice[]>;
  getRecentInvoices: () => Promise<Invoice[]>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
}

export const InvoiceContext = createContext<InvoiceContextType | null>(null);
