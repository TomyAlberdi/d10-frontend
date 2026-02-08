import type { Client } from "@/interfaces/ClientInterfaces";

export interface CartProduct {
  id: string;
  name: string;
  measureType: string;
  priceByMeasureUnit: number;
  measureUnitQuantity: number;
  saleUnitType: string;
  priceBySaleUnit: number;
  saleUnitQuantity: number;
  individualDiscount: number;
  subtotal: number;
}

export interface Cart {
  client: Client | null;
  products: CartProduct[];
  status: string;
  discount: number;
  total: number;
}
