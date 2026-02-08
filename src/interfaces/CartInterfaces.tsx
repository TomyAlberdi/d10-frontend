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
