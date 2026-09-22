import { formatPrice, getMonthName } from "@/lib/utils";

/** The data page always reads the running year. */
export const CURRENT_YEAR = new Date().getFullYear();

export const formatMoney = (value: number) => `$ ${formatPrice(value)}`;

export const formatM2 = (value: number) =>
  `${value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;

/** Short axis ticks: 1.250.000 -> "1,3 M". */
export const formatCompact = (value: number) =>
  value.toLocaleString("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

/**
 * Keeps the months of the current year that already started and turns a ratio
 * whose denominator is zero into null, so the area shows a gap for a month
 * with no sales instead of diving to 0.
 */
export const toChartRows = <T extends { month: number; year: number }>(
  rows: T[],
  ratioKeys: { key: keyof T; denominator: keyof T }[],
) => {
  const now = new Date();
  return rows
    .filter(
      (row) =>
        row.year !== now.getFullYear() || row.month <= now.getMonth() + 1,
    )
    .map((row) => {
      const out: Record<string, unknown> = {
        ...row,
        monthName: getMonthName(row.month),
      };
      ratioKeys.forEach(({ key, denominator }) => {
        if (!row[denominator]) out[key as string] = null;
      });
      return out;
    });
};
