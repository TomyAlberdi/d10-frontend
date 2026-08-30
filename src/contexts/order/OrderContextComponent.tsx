import type {
  CreateOrderDTO,
  Order,
  OrderContextType,
} from "@/interfaces/OrderInterfaces";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { OrderContext } from "./OrderContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/order`;

/**
 * The orders endpoints answer with a plain text message on failure (insufficient
 * stock, an already received order, …). Those messages are worth showing, so the
 * body is read before falling back to the status code.
 */
const failWith = async (response: Response): Promise<never> => {
  let message = `Error: ${response.status}`;
  try {
    const body = (await response.text()).trim();
    if (body) message = body;
  } catch {
    // Keep the status based message
  }
  toast.error(message);
  throw new Error(message);
};

interface OrderContextComponentProps {
  children: ReactNode;
}

const OrderContextComponent: React.FC<OrderContextComponentProps> = ({
  children,
}) => {
  const getOrders = async (): Promise<Order[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order[];
  };

  const getOrderById = async (id: string): Promise<Order | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order;
  };

  const createOrder = async (dto: CreateOrderDTO): Promise<Order> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order;
  };

  const updateOrder = async (
    id: string,
    dto: CreateOrderDTO,
  ): Promise<Order> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order;
  };

  const updateOrderReceived = async (
    id: string,
    received: boolean,
  ): Promise<Order> => {
    const response = await fetch(
      `${API_URL}/${id}/received?received=${received}`,
      { method: "PATCH" },
    );
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order;
  };

  const deleteOrder = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) await failWith(response);
  };

  const exportData: OrderContextType = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderReceived,
    deleteOrder,
  };

  return (
    <OrderContext.Provider value={exportData}>{children}</OrderContext.Provider>
  );
};

export default OrderContextComponent;
