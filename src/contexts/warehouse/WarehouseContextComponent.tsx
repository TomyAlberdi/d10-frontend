import { Warehouse } from "@/interfaces/WarehouseInterfaces";
import { useState, type ReactNode } from "react";
import {
  WarehouseContext,
  type WarehouseContextType,
} from "./WarehouseContext";

interface WarehouseContextComponentProps {
  children: ReactNode;
}

const WarehouseContextComponent: React.FC<WarehouseContextComponentProps> = ({
  children,
}) => {

  const [Warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWarehouse = async () => {
    setIsLoading(true);
    setWarehouse(null);
    setIsLoading(false);
  };

  const updateCell = async () => {
    setIsLoading(true);
    setWarehouse(null);
    setIsLoading(false);
  };

  const exportData: WarehouseContextType = {
    Warehouse,
    isLoading: false,
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
