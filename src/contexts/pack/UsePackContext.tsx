import { useContext } from "react";
import { PackContext, type PackContextType } from "./PackContext";

export const usePackContext = (): PackContextType => {
  const context = useContext(PackContext);
  if (!context) {
    throw new Error("usePackContext must be used within a PackContextComponent");
  }
  return context;
};
