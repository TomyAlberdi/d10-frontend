import { type Cell, type Warehouse } from "@/interfaces/WarehouseInterfaces";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  WarehouseContext,
  type WarehouseContextType,
} from "./WarehouseContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/warehouse`;

interface WarehouseContextComponentProps {
  children: ReactNode;
}

const WarehouseContextComponent: React.FC<WarehouseContextComponentProps> = ({
  children,
}) => {
  const [Warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWarehouse = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        toast.error(
          `Error al obtener la información del depósito: ${response.status}`,
        );
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = (await response.json()) as Warehouse;
      setWarehouse(data);
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCell = async (cell: Cell) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cell`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cell),
      });
      if (!response.ok) {
        toast.error(`Error al actualizar el depósito: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = (await response.json()) as Cell;
      return data;
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse]);

  const exportData: WarehouseContextType = {
    Warehouse,
    isLoading,
    fetchWarehouse,
    updateCell,
  };

  return (
    <WarehouseContext.Provider value={exportData}>
      {children}
    </WarehouseContext.Provider>
  );
};

export default WarehouseContextComponent;
