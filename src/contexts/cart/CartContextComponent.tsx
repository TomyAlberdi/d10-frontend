import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import type {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from "@/interfaces/InvoiceInterfaces";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext, type CartContextType } from "./CartContext";

const CART_STORAGE_KEY = "d10-cart";

function computeTotal(products: CartProduct[], discount: number): number {
  const subtotalSum = products.reduce((sum, p) => sum + p.subtotal, 0);
  return Math.max(0, subtotalSum - discount);
}

const defaultConsumerClient: Client = {
  id: "6988aaa7a52552790b2cc5ab",
  type: "CONSUMIDOR_FINAL",
  name: "consumidor final",
  address: "",
  phone: "",
  email: "",
  cuitDni: "0",
};

const initialCart: Invoice = {
  id: "",
  client: defaultConsumerClient,
  products: [],
  status: "PENDIENTE",
  discount: 0,
  total: 0,
  notes: undefined,
  paymentMethod: undefined,
  stockDecreased: false,
};

const VALID_STATUSES: InvoiceStatus[] = [
  "PENDIENTE",
  "PAGO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

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
      client: parsed.client ?? defaultConsumerClient,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      status: VALID_STATUSES.includes(parsed.status as InvoiceStatus)
        ? (parsed.status as InvoiceStatus)
        : "PENDIENTE",
      discount: Number.isFinite(discount) ? discount : 0,
      total: Number.isFinite(total) ? total : 0,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
      paymentMethod: parsed.paymentMethod,
      stockDecreased: typeof parsed.stockDecreased === "boolean" ? parsed.stockDecreased : false,
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

  const setCartStatus = useCallback((status: InvoiceStatus) => {
    setCart((prev) => ({
      ...prev,
      status,
    }));
  }, []);

  const setCartNotes = useCallback((notes: string | undefined) => {
    setCart((prev) => ({
      ...prev,
      notes,
    }));
  }, []);

  const setPaymentMethod = useCallback(
    (paymentMethod: PaymentMethod | undefined) => {
      setCart((prev) => ({
        ...prev,
        paymentMethod,
      }));
    },
    [],
  );

  const setStockDecreased = useCallback((stockDecreased: boolean) => {
    setCart((prev) => ({
      ...prev,
      stockDecreased,
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

  const clearCart = useCallback(() => {
    setCart(initialCart);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(initialCart));
    } catch {
      // ignore storage errors
    }
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
      setCartStatus,
      setPaymentMethod,
      setCartNotes,
      setStockDecreased,
      addProduct,
      removeProduct,
      setDiscount,
      clearCart,
    }),
    [
      cart,
      setCartClient,
      setCartStatus,
      setPaymentMethod,
      setCartNotes,
      setStockDecreased,
      addProduct,
      removeProduct,
      setDiscount,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={exportData}>{children}</CartContext.Provider>
  );
};

export default CartContextComponent;
