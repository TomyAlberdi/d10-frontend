import type { Cell, Warehouse } from "@/interfaces/WarehouseInterfaces";
import { createContext } from "react";

export interface WarehouseContextType {
  Warehouse: Warehouse | null;
  isLoading: boolean;
  fetchWarehouse: () => Promise<void>;
  updateCell: (cell: Cell) => Promise<Cell | undefined>;
}

export const WarehouseContext = createContext<WarehouseContextType | null>(
  null,
);
