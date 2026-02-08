import type {
  CreateInvoiceDTO,
  Invoice,
  InvoiceStatus,
} from "@/interfaces/InvoiceInterfaces";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InvoiceContext, type InvoiceContextType } from "./InvoiceContext";

const API_URL = "http://localhost:8082/invoice";

interface InvoiceContextComponentProps {
  children: ReactNode;
}

const InvoiceContextComponent: React.FC<InvoiceContextComponentProps> = ({
  children,
}) => {
  const navigate = useNavigate();

  const createInvoice = async (dto: CreateInvoiceDTO): Promise<void> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      let message: string | null = null;
      try {
        const contentType = response.headers.get("content-type");
        const text = await response.text();
        if (contentType?.includes("application/json")) {
          const body = JSON.parse(text) as {
            message?: string;
            error?: string;
            detail?: string;
          };
          message = body.message ?? body.error ?? body.detail ?? null;
        } else if (text && /stock\s*insuficiente|insuficiente/i.test(text)) {
          message = text;
        }
      } catch {
        // ignore parse errors
      }
      if (message && /stock\s*insuficiente|insuficiente/i.test(message)) {
        toast.error(message);
      } else {
        toast.error(message ?? `Error: ${response.status}`);
      }
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Invoice;
  };

  const updateInvoice = async (
    id: string,
    dto: CreateInvoiceDTO,
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      let message: string | null = null;
      try {
        const contentType = response.headers.get("content-type");
        const text = await response.text();
        if (contentType?.includes("application/json")) {
          const body = JSON.parse(text) as {
            message?: string;
            error?: string;
            detail?: string;
          };
          message = body.message ?? body.error ?? body.detail ?? null;
        } else if (text && /stock\s*insuficiente|insuficiente/i.test(text)) {
          message = text;
        }
      } catch {
        // ignore parse errors
      }
      if (message && /stock\s*insuficiente|insuficiente/i.test(message)) {
        toast.error(message);
      } else {
        toast.error(message ?? `Error: ${response.status}`);
      }
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const deleteInvoiceById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    navigate(-1);
  };

  const searchInvoices = async (q: string): Promise<Invoice[]> => {
    const params = new URLSearchParams({ q });
    const response = await fetch(`${API_URL}/search?${params.toString()}`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Invoice[];
  };

  const getRecentInvoices = async (): Promise<Invoice[]> => {
    const response = await fetch(`${API_URL}/search`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Invoice[];
  };

  const updateInvoiceStatus = async (
    id: string,
    status: InvoiceStatus,
  ): Promise<void> => {
    const params = new URLSearchParams({ status });
    const response = await fetch(`${API_URL}/${id}/status?${params.toString()}`, {
      method: "PATCH",
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const exportData: InvoiceContextType = {
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoiceById,
    searchInvoices,
    getRecentInvoices,
    updateInvoiceStatus,
  };

  return (
    <InvoiceContext.Provider value={exportData}>
      {children}
    </InvoiceContext.Provider>
  );
};

export default InvoiceContextComponent;
