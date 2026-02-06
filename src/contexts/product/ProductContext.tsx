import type {
  CreateProduct,
  Product,
  ProductStockRecord,
} from "@/interfaces/ProductInterfaces";
import { createContext } from "react";

export interface ProductContextType {
  getProductById: (id: string) => Promise<Product | null>;
  listProducts: (
    query: string | null,
    page: number | null,
    size: number | null,
  ) => Promise<Product[]>;
  createProduct: (dto: CreateProduct) => Promise<void>;
  updateProduct: (id: string, dto: CreateProduct) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductDiscontinued: (
    id: string,
    discontinued: boolean,
  ) => Promise<void>;
  updateProductStock: (id: string, record: ProductStockRecord) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | null>(null);
