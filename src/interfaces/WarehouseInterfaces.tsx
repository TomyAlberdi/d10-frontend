import type { Product } from "./ProductInterfaces";

export interface CellItem {
  product: Product;
  quantity: number;
}

export interface CellItemDTO {
  productId: string;
  quantity: number;
}

export interface Cell {
  row: number;
  column: number;
  level: number;
  items: CellItem[];
}

export interface Warehouse {
  id: string;
  cells: Cell[];
}
