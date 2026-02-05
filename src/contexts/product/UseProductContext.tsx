import type { CreateProduct, Product, ProductStockRecord } from "@/interfaces/ProductInterfaces";
import { createContext } from "react";

export interface ProductContextType {
  getById: (id: string) => Promise<Product | null>;
  list: (query: string | null, page : number | null, size: number | null) => Promise<Product[]>;
  create: (dto: CreateProduct) => Promise<void>;
  update: (id: string, dto: CreateProduct) => Promise<void>;
  delete: (id: string) => Promise<void>;
  updateDiscontinued: (id: string, discontinued: boolean) => Promise<void>;
  updateStock: (id: string, record: ProductStockRecord) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | null>(null);