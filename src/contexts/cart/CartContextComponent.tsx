import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { CartContext, type CartContextType } from "./CartContext";

function computeTotal(products: CartProduct[], discount: number): number {
  const subtotalSum = products.reduce((sum, p) => sum + p.subtotal, 0);
  return Math.max(0, subtotalSum - discount);
}

const placeholderClient: Client = {
  id: "",
  type: "",
  name: "",
  address: null,
  phone: null,
  email: null,
  cuitDni: "",
};

const initialCart: Invoice = {
  id: "",
  client: placeholderClient,
  products: [],
  status: "PENDIENTE",
  discount: 0,
  total: 0,
};

interface CartContextComponentProps {
  children: ReactNode;
}

const CartContextComponent: React.FC<CartContextComponentProps> = ({
  children,
}) => {
  const [cart, setCart] = useState<Invoice>(initialCart);

  const setCartClient = useCallback((client: Client) => {
    setCart((prev) => ({
      ...prev,
      client,
    }));
  }, []);

  const addProduct = useCallback((product: CartProduct) => {
    setCart((prev) => {
      const products = [...prev.products, product];
      const total = computeTotal(products, prev.discount);
      return {
        ...prev,
        products,
        total,
      };
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setCart((prev) => {
      const products = prev.products.filter((p) => p.id !== productId);
      const total = computeTotal(products, prev.discount);
      return {
        ...prev,
        products,
        total,
      };
    });
  }, []);

  const setDiscount = useCallback((discount: number) => {
    setCart((prev) => {
      const total = computeTotal(prev.products, discount);
      return {
        ...prev,
        discount,
        total,
      };
    });
  }, []);

  const exportData: CartContextType = useMemo(
    () => ({
      cart,
      setCartClient,
      addProduct,
      removeProduct,
      setDiscount,
    }),
    [cart, setCartClient, addProduct, removeProduct, setDiscount],
  );

  return (
    <CartContext.Provider value={exportData}>{children}</CartContext.Provider>
  );
};

export default CartContextComponent;
