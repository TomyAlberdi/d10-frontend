import { useContext } from "react";
import { StockLogContext } from "./StockLogContext";

export const useStockLogContext = () => {
  const context = useContext(StockLogContext);
  if (!context) {
    throw new Error("useStockLog must be used within a StockLogProvider");
  }
  return context;
};
