export interface Client {
  id: string;
  type: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  cuitDni: string;
}

export interface CreateClientDTO {
  type: string;
  name: string;
  address: string;
  cuitDni: string;
  email: string;
  phone: string;
}
