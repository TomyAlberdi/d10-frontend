import type { Client } from "@/interfaces/ClientInterfaces";
import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { CashRegisterType } from "@/interfaces/CashRegisterInterfaces";
import type {
  InvoicePaymentDTO,
  InvoiceStatus,
} from "@/interfaces/InvoiceInterfaces";

/** Name shown for a sale made without a client. */
export const NO_CLIENT_LABEL = "Consumidor Final";

/** Name to show for an invoice's client, which is null for anonymous sales. */
export function invoiceClientName(client: Client | null | undefined): string {
  return client?.name || NO_CLIENT_LABEL;
}

/** Statuses whose detail PDF is a sale rather than a quote. */
const SALE_DOCUMENT_STATUSES: readonly InvoiceStatus[] = ["PAGO", "ENTREGADO"];

/**
 * Name of the invoice detail document: "Venta" once the sale is paid or
 * delivered, "Presupuesto" otherwise. Used for both the PDF title and its
 * file name.
 */
export function invoiceDocumentLabel(
  status: InvoiceStatus | undefined,
): "Venta" | "Presupuesto" {
  return status && SALE_DOCUMENT_STATUSES.includes(status)
    ? "Venta"
    : "Presupuesto";
}

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

/** Sum of the line subtotals minus the invoice discount, never negative. */
export function computeTotal(
  products: CartProduct[],
  discount: number,
): number {
  const subtotalSum = products.reduce((sum, p) => sum + p.subtotal, 0);
  return Math.max(0, subtotalSum - discount);
}

/**
 * The line with a new quantity of sale units: its measure and subtotal follow.
 * Shared by the cart and the invoice edit form.
 */
export function updateLineQuantity(
  product: CartProduct,
  saleUnitQuantity: number,
): CartProduct {
  const measurePerSaleUnit = product.measurePerSaleUnit
    ? product.measurePerSaleUnit
    : product.measureUnitQuantity / product.saleUnitQuantity;
  return {
    ...product,
    saleUnitQuantity,
    measureUnitQuantity: parseFloat(
      (saleUnitQuantity * measurePerSaleUnit).toFixed(2),
    ),
    subtotal: Math.max(
      0,
      saleUnitQuantity * product.priceBySaleUnit - product.individualDiscount,
    ),
  };
}

/** What a sale still owes, never negative. */
export function owedAmount(total: number, partialPayment = 0): number {
  return Math.max(0, total - partialPayment);
}

/**
 * Statuses picked by hand in the forms, in button order. Deuda is picked as
 * "Pago parcial": a payment that does not cover the total.
 */
export const SELECTABLE_STATUSES: readonly InvoiceStatus[] = [
  "PENDIENTE",
  "DEUDA",
  "PAGO",
  "ENTREGADO",
  "CANCELADO",
];

/** Statuses whose form shows the payment card. */
export const COLLECTED_STATUSES: readonly InvoiceStatus[] = [
  "PAGO",
  "ENVIADO",
  "ENTREGADO",
  "DEUDA",
];

/**
 * What the user typed in the payment card. `amount` is null until the user
 * edits it, so it keeps following what the sale owes.
 */
export interface PaymentDraft {
  /** Off only while an optional payment (on an existing debt) is not wanted. */
  enabled: boolean;
  amount: string | null;
  registerType: CashRegisterType;
  pesoAmount: string;
}

export const parseAmount = (value: string): number =>
  value.trim() === "" ? NaN : Number(value.replace(",", "."));

export interface ResolvedPayment {
  /** The payment to send, or null when the form must not be saved yet. */
  payment: InvoicePaymentDTO | null;
  /** Amount shown in the input. */
  amountText: string;
  /** The sale stays a debt after this payment. */
  isPartial: boolean;
  /** Pesos still owed after this payment, for partial payments. */
  remaining: number;
  error: string | null;
}

/**
 * Turns the payment card into what is sent to the backend. `partial` is
 * whether the sale was marked "Pago parcial": the amount starts empty, and a
 * USD payment says how many pesos it covers. A partial payment that covers
 * what is owed is sent as a full one, so the sale is saved as paid.
 */
export function resolvePayment(
  draft: PaymentDraft,
  owed: number,
  partial: boolean,
): ResolvedPayment {
  const amountText =
    draft.amount ??
    (partial ? "" : String(Number(owed.toFixed(2))).replace(".", ","));
  const amount = parseAmount(amountText);
  const isUsd = draft.registerType === "USD";
  const base = { amountText, isPartial: false, remaining: 0 };
  const missingAmount = {
    ...base,
    payment: null,
    error: "Ingresá el monto recibido.",
  };

  if (!Number.isFinite(amount) || amount < 0 || (!partial && amount <= 0)) {
    return missingAmount;
  }
  let counted = amount;
  let pesoAmount: number | undefined;
  if (isUsd && partial) {
    pesoAmount = parseAmount(draft.pesoAmount);
    if (amount > 0 && (!Number.isFinite(pesoAmount) || pesoAmount < 0)) {
      return {
        ...base,
        payment: null,
        error: "Indicá cuántos pesos cubre el pago en USD.",
      };
    }
    counted = Number.isFinite(pesoAmount) ? pesoAmount : 0;
  }
  const remaining = owedAmount(owed, counted);
  const isPartial = partial && remaining >= PAYMENT_TOLERANCE;
  if (!isPartial && amount <= 0) {
    return missingAmount;
  }
  return {
    ...base,
    isPartial,
    remaining: isPartial ? remaining : 0,
    payment: {
      amount,
      registerType: draft.registerType,
      partial: isPartial,
      pesoAmount: isUsd && isPartial ? pesoAmount : undefined,
    },
    error: null,
  };
}

interface SavedStatusState {
  /** Status picked in the form. */
  status: InvoiceStatus;
  total: number;
  /** What the sale had paid before this save. */
  paidBefore: number;
  stockDecreased?: boolean;
  /** The payment registered with this save, if any. */
  payment: ResolvedPayment | null;
}

/**
 * Status the sale is saved with. "Pago parcial" stays a debt while something
 * is owed and becomes Pago once the payments cover the total; a full payment
 * keeps the picked status; without a payment, stock that left unpaid turns
 * the sale into a debt.
 */
export function savedInvoiceStatus({
  status,
  total,
  paidBefore,
  stockDecreased,
  payment,
}: SavedStatusState): InvoiceStatus {
  if (status === "DEUDA") {
    const stillOwes = payment
      ? payment.isPartial
      : total - paidBefore >= PAYMENT_TOLERANCE;
    return stillOwes ? "DEUDA" : "PAGO";
  }
  if (payment) {
    return status;
  }
  return resolveInvoiceStatus({
    status,
    total,
    partialPayment: paidBefore,
    stockDecreased,
  });
}
