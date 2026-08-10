import type {
  CreateOrderDTO,
  Order,
  OrderContextType,
  OrderFilters,
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
  const getOrders = async (filters: OrderFilters = {}): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters.date) params.append("date", filters.date);
    if (filters.received != null)
      params.append("received", String(filters.received));

    const query = params.toString();
    const response = await fetch(query ? `${API_URL}?${query}` : API_URL);
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order[];
  };

  const getOrderDates = async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/dates`);
    if (!response.ok) return failWith(response);
    return (await response.json()) as string[];
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

  const receiveOrdersByDate = async (date: string): Promise<Order[]> => {
    const response = await fetch(
      `${API_URL}/received?date=${encodeURIComponent(date)}`,
      { method: "PATCH" },
    );
    if (!response.ok) return failWith(response);
    return (await response.json()) as Order[];
  };

  const deleteOrder = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) await failWith(response);
  };

  const exportData: OrderContextType = {
    getOrders,
    getOrderDates,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderReceived,
    receiveOrdersByDate,
    deleteOrder,
  };

  return (
    <OrderContext.Provider value={exportData}>{children}</OrderContext.Provider>
  );
};

export default OrderContextComponent;
