import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number): string {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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