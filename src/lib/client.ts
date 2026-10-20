import type { Client, ClientType } from "@/interfaces/ClientInterfaces";

/** Display name of a client's fiscal type. */
export function clientTypeLabel(type: ClientType): string {
  return type === "CONSUMIDOR_FINAL"
    ? "Consumidor Final"
    : "Responsable Inscripto";
}

/** Text color for a balance: green in the client's favor, red for debt. */
export function balanceClassName(balance: number): string {
  if (balance > 0) return "text-emerald-600 dark:text-emerald-400";
  if (balance < 0) return "text-destructive";
  return "";
}

/**
 * Which clients to list by balance: "POSITIVE" is credit in the client's
 * favor, "NEGATIVE" a pending debt.
 */
export type BalanceFilter = "ALL" | "POSITIVE" | "NEGATIVE";

export const BALANCE_FILTER_LABELS: Record<BalanceFilter, string> = {
  ALL: "Todos",
  POSITIVE: "Saldo a favor",
  NEGATIVE: "Con deuda",
};

export function matchesBalanceFilter(
  client: Client,
  filter: BalanceFilter,
): boolean {
  if (filter === "POSITIVE") return client.balance > 0;
  if (filter === "NEGATIVE") return client.balance < 0;
  return true;
}
