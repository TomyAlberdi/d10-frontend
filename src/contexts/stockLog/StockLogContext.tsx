import type { StockLogContextType } from "@/interfaces/StockLogInterfaces";
import { createContext } from "react";

export const StockLogContext = createContext<StockLogContextType | null>(null);
