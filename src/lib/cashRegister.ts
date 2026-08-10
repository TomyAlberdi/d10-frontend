import type { CashRegisterType } from "@/interfaces/CashRegisterInterfaces";
import type { PaymentMethod } from "@/interfaces/InvoiceInterfaces";

/**
 * Register each payment method feeds. Declared as a full `Record` so adding a
 * payment method breaks the build until it is mapped to a register, instead of
 * silently falling into a default branch.
 */
export const PAYMENT_METHOD_REGISTER_TYPE: Record<
  PaymentMethod,
  CashRegisterType
> = {
  CASH: "PAPER",
  DIGITAL: "DIGITAL",
  USD: "USD",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  DIGITAL: "Transferencia",
  USD: "USD",
};

export const REGISTER_TYPE_LABELS: Record<CashRegisterType, string> = {
  PAPER: "Efectivo",
  DIGITAL: "Transferencia",
  USD: "USD",
};

/** Payment methods in the order they are offered in the invoice forms. */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "CASH",
  "DIGITAL",
  "USD",
];

/** Registers in the order they are shown in the cash register screens. */
export const REGISTER_TYPES: readonly CashRegisterType[] = [
  "PAPER",
  "DIGITAL",
  "USD",
];
