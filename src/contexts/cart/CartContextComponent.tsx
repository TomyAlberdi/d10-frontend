import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext, type CartContextType } from "./CartContext";

const CART_STORAGE_KEY = "d10-cart";

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

function loadCartFromStorage(): Invoice {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return initialCart;
    const parsed = JSON.parse(raw) as Invoice;
    if (!parsed || typeof parsed !== "object") return initialCart;
    const discount = Number(parsed.discount);
    const total = Number(parsed.total);
    return {
      id: parsed.id ?? "",
      client: parsed.client ?? placeholderClient,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      status: parsed.status ?? "PENDIENTE",
      discount: Number.isFinite(discount) ? discount : 0,
      total: Number.isFinite(total) ? total : 0,
    };
  } catch {
    return initialCart;
  }
}

interface CartContextComponentProps {
  children: ReactNode;
}

const CartContextComponent: React.FC<CartContextComponentProps> = ({
  children,
}) => {
  const [cart, setCart] = useState<Invoice>(loadCartFromStorage);

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

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

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
