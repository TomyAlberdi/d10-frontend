import type { Client, CreateClientDTO } from "@/interfaces/ClientInterfaces";
import { createContext } from "react";

export interface ClientContextType {
  getClientById: (id: string) => Promise<Client | null>;
  createClient: (dto: CreateClientDTO) => Promise<void>;
  updateClient: (id: string, dto: CreateClientDTO) => Promise<void>;
  deleteClientById: (id: string) => Promise<void>;
  searchClients: (q: string) => Promise<Client[]>;
}

export const ClientContext = createContext<ClientContextType | null>(null);
