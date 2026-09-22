export interface Client {
  id: string;
  type: ClientType;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  cuitDni: string;
  /** Positive: credit in the client's favor. Negative: pending debt. */
  balance: number;
}

export interface CreateClientDTO {
  type: ClientType;
  name: string;
  address: string;
  cuitDni: string;
  email: string;
  phone: string;
}

export type ClientType = "CONSUMIDOR_FINAL" | "RESPONSABLE_INSCRIPTO";

export type BalanceAdjustmentType = "ADD" | "REMOVE";

export interface AdjustClientBalanceDTO {
  amount: number;
  type: BalanceAdjustmentType;
  description?: string;
}
