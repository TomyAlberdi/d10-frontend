import { useContext } from "react";
import { ShipmentContext, type ShipmentContextType } from "./ShipmentContext";

export const useShipmentContext = (): ShipmentContextType => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error("useShipmentContext must be used within a ShipmentContextComponent");
  }
  return context;
};
