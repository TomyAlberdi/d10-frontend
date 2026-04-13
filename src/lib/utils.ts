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

export const CATEGORIES = Object.keys(categoriesData) as string[];
export const getSubcategories = (category: string): string[] =>
  category ? (categoriesData as Record<string, string[]>)[category] ?? [] : [];