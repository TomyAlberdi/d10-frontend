import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import type { Invoice, InvoiceStatus } from "@/interfaces/InvoiceInterfaces";
import { createContext } from "react";

export interface CartContextType {
  cart: Invoice;
  setCartClient: (client: Client) => void;
  setCartStatus: (status: InvoiceStatus) => void;
  addProduct: (product: CartProduct) => void;
  removeProduct: (productId: string) => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | null>(null);
