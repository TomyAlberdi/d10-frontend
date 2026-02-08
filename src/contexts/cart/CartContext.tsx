import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import { createContext } from "react";

export interface CartContextType {
  cart: Invoice;
  setCartClient: (client: Client) => void;
  addProduct: (product: CartProduct) => void;
  removeProduct: (productId: string) => void;
  setDiscount: (discount: number) => void;
}

export const CartContext = createContext<CartContextType | null>(null);
