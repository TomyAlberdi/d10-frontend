import type { Product } from "@/interfaces/ProductInterfaces";

export interface Order {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  providerName?: string;
  /** Amount to order, expressed in the sale unit of the product. */
  saleUnitQuantity: number;
  saleUnitType: Product["saleUnitType"];
  /** Batch the order belongs to, as `yyyy-MM-dd`. */
  orderDate: string;
  received: boolean;
  /** ISO date-time string, only present once the order was received. */
  receivedDatetime?: string;
  detail?: string;
}

export interface CreateOrderDTO {
  productId: string;
  saleUnitQuantity: number;
  /** Optional, the backend defaults to the current date. */
  orderDate?: string;
  detail?: string;
}

/** Filters accepted by the orders endpoint. Both are optional. */
export interface OrderFilters {
  date?: string | null;
  received?: boolean | null;
}

export interface OrderContextType {
  /** Orders matching the given filters, most recent batch first. */
  getOrders: (filters?: OrderFilters) => Promise<Order[]>;
  /** Dates that have at least one order, most recent first. */
  getOrderDates: () => Promise<string[]>;
  /** A single order, or `null` when it no longer exists. */
  getOrderById: (id: string) => Promise<Order | null>;
  createOrder: (dto: CreateOrderDTO) => Promise<Order>;
  updateOrder: (id: string, dto: CreateOrderDTO) => Promise<Order>;
  /**
   * Receive a single order (adding its sale units to the stock of the product)
   * or set it back to pending, which takes them out again.
   */
  updateOrderReceived: (id: string, received: boolean) => Promise<Order>;
  /** Receive every pending order of a batch, adding the stock of each one. */
  receiveOrdersByDate: (date: string) => Promise<Order[]>;
  deleteOrder: (id: string) => Promise<void>;
}
