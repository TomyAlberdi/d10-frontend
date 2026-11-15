import type { Product } from "@/interfaces/ProductInterfaces";

/** A number of sale units offered to cover a measure the client asked for. */
export interface CoverOption {
  saleUnits: number;
  /** Measure the sale units add up to. */
  measure: number;
  /** Measure over the one asked for. */
  surplus: number;
  /** Surplus as a percentage of the measure asked for. */
  surplusPercent: number;
}

const SALE_UNIT_PLURALS: Record<Product["saleUnitType"], string> = {
  CAJA: "CAJAS",
  JUEGO: "JUEGOS",
  UNIDAD: "UNIDADES",
};

/** "CAJA" for one sale unit, "CAJAS" for any other count. */
export function saleUnitLabel(
  saleUnitType: Product["saleUnitType"],
  count: number,
): string {
  return count === 1 ? saleUnitType : SALE_UNIT_PLURALS[saleUnitType];
}

/** Rounds a measure to two decimals, dropping float error (5 × 2.88). */
export function roundMeasure(value: number): number {
  return parseFloat(value.toFixed(2));
}

/** A measure the way the screens show it: "5,76". */
export function formatMeasure(value: number): string {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

/** Reads a typed measure, which may use a comma as decimal separator. */
export function parseMeasure(text: string): number {
  return text.trim() === "" ? NaN : Number(text.replace(",", "."));
}

/** Whether a quantity of this product can be typed in its measure unit. */
export function canSellByMeasure(product: Product): boolean {
  return (
    product.measurePerSaleUnit > 0 &&
    product.measureType !== product.saleUnitType
  );
}

/**
 * Sale units that cover `measure`, since they are not split: the fewest that
 * reach it, and one more. A measure that is not positive has no options.
 */
export function coverOptions(
  measure: number,
  measurePerSaleUnit: number,
): CoverOption[] {
  if (!(measure > 0) || !(measurePerSaleUnit > 0)) return [];
  // Rounded first so 5.76 M2 at 2.88 per box asks for 2 boxes, not 3.
  const exact = parseFloat((measure / measurePerSaleUnit).toFixed(6));
  const fewest = Math.max(1, Math.ceil(exact));
  return [fewest, fewest + 1].map((saleUnits) => {
    const total = roundMeasure(saleUnits * measurePerSaleUnit);
    const surplus = Math.max(0, roundMeasure(total - measure));
    return {
      saleUnits,
      measure: total,
      surplus,
      surplusPercent: (surplus / measure) * 100,
    };
  });
}
