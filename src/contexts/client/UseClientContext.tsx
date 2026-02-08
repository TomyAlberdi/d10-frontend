import { useContext } from "react";
import { ClientContext } from "./ClientContext";

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error(
      "useClientContext must be used within a ClientContextComponent",
    );
  }
  return context;
};
