import { useContext } from "react";
import { CashRegisterContext } from "./CashRegisterContext";

export const useCashRegisterContext = () => {
  const context = useContext(CashRegisterContext);
  if (!context) {
    throw new Error(
      "useCashRegisterContext must be used within a CashRegisterContextComponent",
    );
  }
  return context;
};

