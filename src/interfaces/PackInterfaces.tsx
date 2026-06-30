export interface PackItem {
  productId: string;
  productName: string;
  quantity: number;
  priceBySaleUnit: number;
}

export interface Pack {
  id: string;
  name: string;
  items: PackItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackDTO {
  name: string;
  items: CreatePackItemDTO[];
}

export interface CreatePackItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  priceBySaleUnit: number;
}
