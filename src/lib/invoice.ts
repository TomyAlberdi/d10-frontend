import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";

/** Tolerance used when comparing amounts: a balance under a cent is paid. */
const PAYMENT_TOLERANCE = 0.01;

/**
 * Statuses that mean the sale is settled. Picking one of them fills the paid
 * amount with the total, so the sale is not turned into a debt.
 */
export const SETTLED_STATUSES: readonly InvoiceStatus[] = [
  "PAGO",
  "ENVIADO",
  "ENTREGADO",
];

interface InvoicePaymentState {
  status: InvoiceStatus;
  total: number;
  partialPayment?: number;
  stockDecreased?: boolean;
}

/**
 * A sale whose products already left the stock and whose payment does not cover
 * the total is a debt, no matter which status was picked. Cancelled sales keep
 * their status: they give their stock back instead of being collected.
 *
 * Mirrors `InvoiceService#applyDebtStatus` on the backend, which has the last
 * word — this is only so the screens can show the status that will be saved.
 */
export function resolveInvoiceStatus({
  status,
  total,
  partialPayment,
  stockDecreased,
}: InvoicePaymentState): InvoiceStatus {
  if (status === "CANCELADO" || !stockDecreased) {
    return status;
  }
  const paid = partialPayment ?? 0;
  return total - paid >= PAYMENT_TOLERANCE ? "DEUDA" : status;
}
