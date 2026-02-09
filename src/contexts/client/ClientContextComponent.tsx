import type { Client, CreateClientDTO } from "@/interfaces/ClientInterfaces";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ClientContext, type ClientContextType } from "./ClientContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/client`;

interface ClientContextComponentProps {
  children: ReactNode;
}

const ClientContextComponent: React.FC<ClientContextComponentProps> = ({
  children,
}) => {
  const navigate = useNavigate();

  const getClientById = async (id: string): Promise<Client | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Client;
  };

  const createClient = async (dto: CreateClientDTO): Promise<void> => {
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

  const updateClient = async (
    id: string,
    dto: CreateClientDTO,
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

  const deleteClientById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    navigate(-1);
  };

  const searchClients = async (q: string): Promise<Client[]> => {
    const params = new URLSearchParams({ q });
    const response = await fetch(`${API_URL}/search?${params.toString()}`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Client[];
  };

  const exportData: ClientContextType = {
    getClientById,
    createClient,
    updateClient,
    deleteClientById,
    searchClients,
  };

  return (
    <ClientContext.Provider value={exportData}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientContextComponent;
