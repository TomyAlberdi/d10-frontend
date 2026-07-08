import type { Contact, CreateContactDTO } from "@/interfaces/ContactInterfaces";
import type { PaginatedResult } from "@/interfaces/ProductInterfaces";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { ContactContext, type ContactContextType } from "./ContactContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/contact`;

interface ContactContextComponentProps {
  children: ReactNode;
}

const ContactContextComponent: React.FC<ContactContextComponentProps> = ({
  children,
}) => {
  const getContactById = async (id: string): Promise<Contact | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Contact;
  };

  const listContacts = async (
    query: string | null,
    type: string | null,
    page: number | null,
    size: number | null,
  ): Promise<PaginatedResult<Contact>> => {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (type) params.append("type", type);
    if (page !== null) params.append("page", page.toString());
    if (size !== null) params.append("size", size.toString());

    const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as PaginatedResult<Contact>;
  };

  const createContact = async (dto: CreateContactDTO): Promise<void> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const updateContact = async (
    id: string,
    dto: CreateContactDTO,
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const deleteContactById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const exportData: ContactContextType = {
    getContactById,
    listContacts,
    createContact,
    updateContact,
    deleteContactById,
  };

  return (
    <ContactContext.Provider value={exportData}>
      {children}
    </ContactContext.Provider>
  );
};

export default ContactContextComponent;
