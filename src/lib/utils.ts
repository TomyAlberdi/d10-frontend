import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import categoriesData from "./../Pages/product/categories.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getMonthName(month: number): string {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[month - 1] || "";
}

// Helper to detect "#" followed by exactly 6 digits
export const hasInvoiceCode = (description: string): boolean => {
  return /#\d{6}/.test(description);
};

// -------------------------------------------------------------
// backend health helpers
// -------------------------------------------------------------
/**
 * perform a lightweight request against the backend health endpoint.
 * resolves to `true` if server responds with 2xx, otherwise `false`.
 */
export async function isBackendReachable(): Promise<boolean> {
  try {
    const base = import.meta.env.VITE_BASE_API_URL as string;
    const res = await fetch(`${base}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export function getNextWednesdays(count: number): string[] {
  const result: string[] = [];
  const now = new Date();
  const daysUntilWed = (3 - now.getDay() + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + daysUntilWed);
  for (let i = 0; i < count; i++) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    result.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 7);
  }
  return result;
}

export function formatWednesdayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `Miércoles ${day}/${month}/${year}`;
}

export const CATEGORIES = Object.keys(categoriesData) as string[];
export const getSubcategories = (category: string): string[] =>
  category
    ? ((categoriesData as Record<string, string[]>)[category] ?? [])
    : [];
