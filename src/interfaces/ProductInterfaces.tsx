export interface PartialProduct {
    id: string;
    code: string;
    name: string;
    discontinued: boolean;
}

export interface ProductStock {
  quantity: number;
  measureUnitEquivalent: number;
  recordList: ProductStockRecord[];
}

export interface ProductStockRecord {
  type: "IN" | "OUT";
  quantity: number;
  date: string;
}

export interface ProductCharacteristic {
  key: "COLOR" | "ORIGEN" | "BORDE" | "ASPECTO" | "TEXTURA" | "TRANSITO",
  value: string;
}

export interface Product extends PartialProduct {
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