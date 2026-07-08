import { useContext } from "react";
import { ContactContext, type ContactContextType } from "./ContactContext";

export const useContactContext = (): ContactContextType => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error(
      "useContactContext must be used within a ContactContextComponent",
    );
  }
  return context;
};
