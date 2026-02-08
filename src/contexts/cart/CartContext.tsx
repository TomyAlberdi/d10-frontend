import type { Cart, CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import { createContext } from "react";

export interface CartContextType {
  cart: Cart;
  setCartClient: (client: Client) => void;
  addProduct: (product: CartProduct) => void;
  removeProduct: (productId: string) => void;
  setDiscount: (discount: number) => void;
}

export const CartContext = createContext<CartContextType | null>(null);
