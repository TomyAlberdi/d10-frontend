import type {
  CashRegisterContextType,
  CashRegisterDTO,
  CashRegisterStatusChangePayload,
  CashRegisterTransaction,
  CreateCashRegisterTransactionDTO,
} from "@/interfaces/CashRegisterInterfaces";
import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CashRegisterContext } from "./CashRegisterContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/cash-register`;

const PAID_STATUSES: InvoiceStatus[] = ["PAGO", "ENVIADO", "ENTREGADO"];

interface CashRegisterContextComponentProps {
  children: ReactNode;
}

const CashRegisterContextComponent: React.FC<
  CashRegisterContextComponentProps
> = ({ children }) => {
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [isLoadingAmount, setIsLoadingAmount] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<CashRegisterTransaction[]>(
    [],
  );
  const [isLoadingTransactions, setIsLoadingTransactions] =
    useState<boolean>(false);

  const fetchCurrentAmount = useCallback(async () => {
    setIsLoadingAmount(true);
    try {
      const response = await fetch(`${API_URL}`);
      if (!response.ok) {
        toast.error(`Error al obtener el monto actual: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const amount = (await response.json()) as CashRegisterDTO;
      setCurrentAmount(amount.currentAmount);
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoadingAmount(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (date?: string) => {
    setIsLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      if (date) {
        params.append("date", date);
      }
      const url = params.toString()
        ? `${API_URL}/transactions?${params.toString()}`
        : `${API_URL}/transactions`;
      const response = await fetch(url);
      if (!response.ok) {
        toast.error(`Error al obtener transacciones: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = (await response.json()) as CashRegisterTransaction[];
      setTransactions(data);
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  const addCash = useCallback(
    async (amount: number, description?: string) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("El monto debe ser mayor a 0");
        return;
      }
      try {
        const dto: CreateCashRegisterTransactionDTO = {
          amount,
          type: "IN",
          description: description || "Ingreso manual de caja",
        };
        const response = await fetch(`${API_URL}/transactions`, {
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
            } else {
              message = text || null;
            }
          } catch {
            // ignore parse errors
          }
          toast.error(message ?? `Error: ${response.status}`);
          throw new Error(`HTTP Error: ${response.status}`);
        }
        toast.success("Monto agregado a la caja");
        await fetchCurrentAmount();
        await fetchTransactions();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmount, fetchTransactions],
  );

  const removeCash = useCallback(
    async (amount: number, description?: string) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("El monto debe ser mayor a 0");
        return;
      }
      try {
        const dto: CreateCashRegisterTransactionDTO = {
          amount,
          type: "OUT",
          description: description || "Egreso manual de caja",
        };
        const response = await fetch(`${API_URL}/transactions`, {
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
            } else {
              message = text || null;
            }
          } catch {
            // ignore parse errors
          }
          toast.error(message ?? `Error: ${response.status}`);
          throw new Error(`HTTP Error: ${response.status}`);
        }
        toast.success("Monto retirado de la caja");
        await fetchCurrentAmount();
        await fetchTransactions();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmount, fetchTransactions],
  );

  const updateTransaction = useCallback(
    async (id: string, dto: CreateCashRegisterTransactionDTO) => {
      try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
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
            } else {
              message = text || null;
            }
          } catch {
            // ignore parse errors
          }
          toast.error(message ?? `Error: ${response.status}`);
          throw new Error(`HTTP Error: ${response.status}`);
        }
        toast.success("Transacción actualizada");
        await fetchCurrentAmount();
        await fetchTransactions();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmount, fetchTransactions],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          toast.error(`Error al eliminar transacción: ${response.status}`);
          throw new Error(`HTTP Error: ${response.status}`);
        }
        toast.success("Transacción eliminada");
        await fetchCurrentAmount();
        await fetchTransactions();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmount, fetchTransactions],
  );

  const applyInvoiceStatusChange = useCallback(
    async ({
      previousStatus,
      nextStatus,
      total,
      stockDecreasedInitially,
    }: CashRegisterStatusChangePayload) => {
      // Respect business rule:
      // - Only when status is set to PAGO / ENVIADO / ENTREGADO
      // - Never if stockDecreased was already true initially.
      if (stockDecreasedInitially) return;

      const isNextPaid = PAID_STATUSES.includes(nextStatus);
      const wasAlreadyPaid =
        previousStatus !== null && PAID_STATUSES.includes(previousStatus);

      if (!isNextPaid || wasAlreadyPaid) return;
      if (!Number.isFinite(total) || total <= 0) return;

      try {
        const dto: CreateCashRegisterTransactionDTO = {
          amount: total,
          type: "IN",
          description: `Factura pagada/entregada/enviada - Total: $${total.toFixed(2)}`,
        };
        const response = await fetch(`${API_URL}/transactions`, {
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
            } else {
              message = text || null;
            }
          } catch {
            // ignore parse errors
          }
          toast.error(
            message ??
            `Error al registrar pago de factura en caja: ${response.status}`,
          );
          throw new Error(`HTTP Error: ${response.status}`);
        }
        await fetchCurrentAmount();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmount],
  );

  useEffect(() => {
    fetchCurrentAmount();
  }, [fetchCurrentAmount]);

  const exportData: CashRegisterContextType = useMemo(
    () => ({
      currentAmount,
      isLoadingAmount,
      transactions,
      isLoadingTransactions,
      fetchCurrentAmount,
      addCash,
      removeCash,
      fetchTransactions,
      updateTransaction,
      deleteTransaction,
      applyInvoiceStatusChange,
    }),
    [
      currentAmount,
      isLoadingAmount,
      transactions,
      isLoadingTransactions,
      fetchCurrentAmount,
      addCash,
      removeCash,
      fetchTransactions,
      updateTransaction,
      deleteTransaction,
      applyInvoiceStatusChange,
    ],
  );

  return (
    <CashRegisterContext.Provider value={exportData}>
      {children}
    </CashRegisterContext.Provider>
  );
};

export default CashRegisterContextComponent;

