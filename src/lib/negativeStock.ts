import type { Product } from "@/interfaces/ProductInterfaces";

/** A product the movement would leave below zero (backend StockShortageDTO). */
export interface StockShortage {
  productId: string;
  productName: string;
  saleUnitType: Product["saleUnitType"] | null;
  available: number;
  required: number;
  /** available - required, always below zero. */
  resulting: number;
}

/**
 * Thrown by the context calls that take stock out when the backend answers
 * that the movement needs confirmation. It is not toasted: the caller shows
 * the products and retries with `allowNegativeStock` if the user agrees.
 */
export class NegativeStockError extends Error {
  readonly shortages: StockShortage[];

  constructor(shortages: StockShortage[]) {
    super("Stock negativo");
    this.name = "NegativeStockError";
    this.shortages = shortages;
  }
}

/**
 * Throws a NegativeStockError when the failed response is the backend asking
 * to confirm negative stock. Reads a clone, so the caller can still read the
 * body for any other error.
 */
export const throwIfNegativeStock = async (response: Response) => {
  if (response.status !== 409) return;
  let body: { code?: string; shortages?: StockShortage[] } | null = null;
  try {
    body = await response.clone().json();
  } catch {
    return;
  }
  if (body?.code === "NEGATIVE_STOCK") {
    throw new NegativeStockError(body.shortages ?? []);
  }
};

/** Appends `?allowNegativeStock=true` when set, keeping any existing query. */
export const withAllowNegativeStock = (url: string, allow?: boolean) =>
  allow ? `${url}${url.includes("?") ? "&" : "?"}allowNegativeStock=true` : url;
