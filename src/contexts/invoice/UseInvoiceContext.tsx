import { useContext } from "react";
import { InvoiceContext } from "./InvoiceContext";

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error(
      "useInvoiceContext must be used within an InvoiceContextComponent",
    );
  }
  return context;
};
