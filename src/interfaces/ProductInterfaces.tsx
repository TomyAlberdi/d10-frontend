export interface ProductStock {
  quantity: number;
  measureUnitEquivalent: number;
  recordList: ProductStockRecord[];
}

export interface ProductStockRecord {
  type: "IN" | "OUT";
  quantity: number;
}

export interface ProductCharacteristic {
  key: "COLOR" | "ORIGEN" | "BORDE" | "ASPECTO" | "TEXTURA" | "TRANSITO";
  value: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  discontinued: boolean;
  stock: ProductStock;
  description: string;
  quality: "PRIMERA" | "SEGUNDA";
  providerName: string;
  characteristics: ProductCharacteristic[];
  images: string[];
  category: string;
  subcategory: string;
  dimensions: string;
  measureType: "M2" | "ML" | "MM" | "UNIDAD";
  priceByMeasureUnit: number;
  saleUnitType: "CAJA" | "JUEGO" | "UNIDAD";
  priceBySaleUnit: number;
  measurePerSaleUnit: number;
}

export interface CreateProduct {
  code: string;
  name: string;
  description: string;
  quality: "PRIMERA" | "SEGUNDA";
  providerName: string;
  characteristics: ProductCharacteristic[];
  images: string[];
  category: string;
  subcategory: string;
  dimensions: string;
  measureType: "M2" | "ML" | "MM" | "UNIDAD";
  saleUnitType: "CAJA" | "JUEGO" | "UNIDAD";
  priceBySaleUnit: number;
  measurePerSaleUnit: number;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: Sort;
  unpaged: boolean;
}

export interface PaginatedResult<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}
