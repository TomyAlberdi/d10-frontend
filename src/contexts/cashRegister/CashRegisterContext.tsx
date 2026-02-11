import { createContext } from "react";
import type { CashRegisterContextType } from "@/interfaces/CashRegisterInterfaces";

export const CashRegisterContext =
  createContext<CashRegisterContextType | null>(null);

