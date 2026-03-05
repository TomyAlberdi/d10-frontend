import type { Cell, Warehouse } from "@/interfaces/WarehouseInterfaces";
import { createContext } from "react";

export interface WarehouseContextType {
  Warehouse: Warehouse | null;
  isLoading: boolean;
  fetchWarehouse: () => Promise<void>;
  updateCell: (dto: Cell) => Promise<Cell>;
}

export const WarehouseContext = createContext<WarehouseContextType | null>(
  null,
);
