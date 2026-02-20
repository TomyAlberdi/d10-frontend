import type {
  CashRegisterContextType,
  CashRegisterDTO,
  CashRegisterStatusChangePayload,
  CashRegisterTransaction,
  CashRegisterType,
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
  const [paperAmount, setPaperAmount] = useState<number>(0);
  const [digitalAmount, setDigitalAmount] = useState<number>(0);
  const [isLoadingAmount, setIsLoadingAmount] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<CashRegisterTransaction[]>(
    [],
  );
  const [isLoadingTransactions, setIsLoadingTransactions] =
    useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<CashRegisterType>("PAPER");

  const fetchCurrentAmounts = useCallback(async () => {
    setIsLoadingAmount(true);
    try {
      const [paperResponse, digitalResponse] = await Promise.all([
        fetch(`${API_URL}?type=PAPER`),
        fetch(`${API_URL}?type=DIGITAL`),
      ]);
      if (!paperResponse.ok || !digitalResponse.ok) {
        toast.error(`Error al obtener los montos actuales`);
        throw new Error(`HTTP Error`);
      }
      const paperData = (await paperResponse.json()) as CashRegisterDTO;
      const digitalData = (await digitalResponse.json()) as CashRegisterDTO;
      setPaperAmount(paperData.currentAmount);
      setDigitalAmount(digitalData.currentAmount);
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
      params.append("date", date || new Date().toISOString().split('T')[0]);
      const url = `${API_URL}/transactions?${params.toString()}`;
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
          registerType: selectedType,
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
        await fetchCurrentAmounts();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmounts, selectedType],
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
          registerType: selectedType,
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
        await fetchCurrentAmounts();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmounts, selectedType],
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
        await fetchCurrentAmounts();
        await fetchTransactions();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmounts, fetchTransactions],
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
        await fetchCurrentAmounts();
        await fetchTransactions();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmounts, fetchTransactions],
  );

  const applyInvoiceStatusChange = useCallback(
    async ({
      previousStatus,
      nextStatus,
      total,
      stockDecreasedInitially,
      clientName,
      paymentMethod,
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

      if (!paymentMethod) return;

      const registerType: CashRegisterType = paymentMethod === "CASH" ? "PAPER" : "DIGITAL";

      try {
        const dto: CreateCashRegisterTransactionDTO = {
          amount: total,
          type: "IN",
          description: `Pago ${clientName}`,
          registerType,
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
        await fetchCurrentAmounts();
      } catch (error) {
        // Error already handled
      }
    },
    [fetchCurrentAmounts],
  );

  useEffect(() => {
    fetchCurrentAmounts();
  }, [fetchCurrentAmounts]);

  const exportData: CashRegisterContextType = useMemo(
    () => ({
      paperAmount,
      digitalAmount,
      isLoadingAmount,
      transactions,
      isLoadingTransactions,
      selectedType,
      setSelectedType,
      fetchCurrentAmounts,
      addCash,
      removeCash,
      fetchTransactions,
      updateTransaction,
      deleteTransaction,
      applyInvoiceStatusChange,
    }),
    [
      paperAmount,
      digitalAmount,
      isLoadingAmount,
      transactions,
      isLoadingTransactions,
      selectedType,
      setSelectedType,
      fetchCurrentAmounts,
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
