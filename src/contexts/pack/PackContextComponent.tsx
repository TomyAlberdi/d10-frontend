import type { CreatePackDTO, Pack } from "@/interfaces/PackInterfaces";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { PackContext, type PackContextType } from "./PackContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/pack`;

interface PackContextComponentProps {
  children: ReactNode;
}

const PackContextComponent: React.FC<PackContextComponentProps> = ({
  children,
}) => {
  const getPackById = async (id: string): Promise<Pack | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Pack;
  };

  const getAllPacks = async (): Promise<Pack[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Pack[];
  };

  const createPack = async (dto: CreatePackDTO): Promise<Pack> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Pack;
  };

  const updatePack = async (id: string, dto: CreatePackDTO): Promise<Pack> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Pack;
  };

  const deletePackById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const exportData: PackContextType = {
    getPackById,
    getAllPacks,
    createPack,
    updatePack,
    deletePackById,
  };

  return (
    <PackContext.Provider value={exportData}>{children}</PackContext.Provider>
  );
};

export default PackContextComponent;
