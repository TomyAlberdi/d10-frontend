export interface Client {
  id: string;
  type: ClientType;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  cuitDni: string;
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
