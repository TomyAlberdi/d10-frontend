import type { RevenueBasis } from "@/interfaces/DataInterfaces";
import { useOutletContext } from "react-router-dom";

/**
 * Period and revenue basis shared by every analytics tab.
 *
 * Owned by the Data layout route and passed down through the Outlet, so all
 * the charts on every tab answer the same question about the same period
 * instead of each holding its own year.
 */
export interface DataFilters {
  year: number;
  basis: RevenueBasis;
  /** Inclusive, ISO. Start of the selected year. */
  from: string;
  /** Exclusive, ISO. Start of the following year. */
  to: string;
}

export const useDataFilters = () => useOutletContext<DataFilters>();
