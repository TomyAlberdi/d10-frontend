import type { DataContextType } from "@/interfaces/DataInterfaces";
import { createContext } from "react";

export const DataContext = createContext<DataContextType | null>(null);
