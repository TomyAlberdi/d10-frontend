import type { OrderContextType } from "@/interfaces/OrderInterfaces";
import { createContext } from "react";

export const OrderContext = createContext<OrderContextType | null>(null);
