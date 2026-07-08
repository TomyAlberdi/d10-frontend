import type { Contact, CreateContactDTO } from "@/interfaces/ContactInterfaces";
import type { PaginatedResult } from "@/interfaces/ProductInterfaces";
import { createContext } from "react";

export interface ContactContextType {
  getContactById: (id: string) => Promise<Contact | null>;
  listContacts: (
    query: string | null,
    type: string | null,
    page: number | null,
    size: number | null,
  ) => Promise<PaginatedResult<Contact>>;
  createContact: (dto: CreateContactDTO) => Promise<void>;
  updateContact: (id: string, dto: CreateContactDTO) => Promise<void>;
  deleteContactById: (id: string) => Promise<void>;
}

export const ContactContext = createContext<ContactContextType | null>(null);
