import { useContext } from "react";
import { WarehouseContext } from "./WarehouseContext";

export const useWarehouseContext = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
};
