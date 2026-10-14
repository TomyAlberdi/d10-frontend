import type { Product } from "@/interfaces/ProductInterfaces";

/**
 * One line of an order: the product data copied when the order was saved, plus
 * the amount to receive.
 */
export interface OrderProduct {
  productId: string;
  productCode: string;
  productName: string;
  providerName?: string;
  saleUnitType: Product["saleUnitType"];
  /** Amount to order, expressed in the sale unit of the product. */
  saleUnitQuantity: number;
  detail?: string;
}

export interface Order {
  id: string;
  /** Date the order was written down, as `yyyy-MM-dd`. */
  date: string;
  received: boolean;
  products: OrderProduct[];
}

export interface CreateOrderProductDTO {
  productId: string;
  saleUnitQuantity: number;
  detail?: string;
}

export interface CreateOrderDTO {
  /** Optional, the backend defaults to the current date. */
  date?: string;
  products: CreateOrderProductDTO[];
}

/**
 * An active product with zero, negative or no stock, offered to be ordered
 * again.
 */
export interface RestockProduct {
  productId: string;
  productCode: string;
  productName: string;
  providerName?: string;
  saleUnitType: Product["saleUnitType"];
  /** Current stock in sale units; 0 when the product has no stock data. */
  stockQuantity: number;
  /** Sale units already asked for in pending orders. */
  pendingQuantity: number;
}

export interface OrderContextType {
  /** Every order, most recent first. */
  getOrders: () => Promise<Order[]>;
  /** A single order, or `null` when it no longer exists. */
  getOrderById: (id: string) => Promise<Order | null>;
  createOrder: (dto: CreateOrderDTO) => Promise<Order>;
  updateOrder: (id: string, dto: CreateOrderDTO) => Promise<Order>;
  /** Active products that ran out of stock, by provider and name. */
  getRestockProducts: () => Promise<RestockProduct[]>;
  /** Appends lines to a pending order, leaving the ones it has untouched. */
  addOrderProducts: (
    id: string,
    products: CreateOrderProductDTO[],
  ) => Promise<Order>;
  /**
   * Receive the whole order, adding the sale units of every line to the stock
   * of its product, or set it back to pending, which takes them out again.
   */
  updateOrderReceived: (
    id: string,
    received: boolean,
    allowNegativeStock?: boolean,
  ) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
}
