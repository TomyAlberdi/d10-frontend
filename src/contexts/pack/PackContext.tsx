import type { CreatePackDTO, Pack } from "@/interfaces/PackInterfaces";
import { createContext } from "react";

export interface PackContextType {
  getPackById: (id: string) => Promise<Pack | null>;
  getAllPacks: () => Promise<Pack[]>;
  createPack: (dto: CreatePackDTO) => Promise<Pack>;
  updatePack: (id: string, dto: CreatePackDTO) => Promise<Pack>;
  deletePackById: (id: string) => Promise<void>;
}

export const PackContext = createContext<PackContextType | null>(null);
