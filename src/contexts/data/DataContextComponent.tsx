import type {
  BestSellingProductDTO,
  DataContextType,
  MonthlySummaryRecord,
  SortByEnum,
  TimeSpanEnum,
  TopSellingProductDTO,
} from "@/interfaces/DataInterfaces";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { DataContext } from "./DataContext";

interface DataContextComponentProps {
  children: ReactNode;
}

const DataContextComponent: React.FC<DataContextComponentProps> = ({
  children,
}) => {
  const API_URL = `${import.meta.env.VITE_BASE_API_URL}/data`;

  const getYearlySalesData = async (year: number) => {
    const response = await fetch(`${API_URL}/yearly-sales/${year}`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as MonthlySummaryRecord[];
  };

  const getBestSellingProducts = async (
    timeSpan: TimeSpanEnum,
    sortBy: SortByEnum,
  ) => {
    const response = await fetch(
      `${API_URL}/best-selling-products/${timeSpan}/${sortBy}`,
    );
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as BestSellingProductDTO[];
  };

  const getTop5ByCategory = async (
    category: string,
    sortBy: SortByEnum,
    timespan: TimeSpanEnum,
  ) => {
    const response = await fetch(
      `${API_URL}/top-by-category/${category}/${sortBy}/${timespan}`,
    );
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as TopSellingProductDTO[];
  };

  const getTop5BySubcategory = async (
    subcategory: string,
    sortBy: SortByEnum,
    timespan: TimeSpanEnum,
  ) => {
    const response = await fetch(
      `${API_URL}/top-by-subcategory/${subcategory}/${sortBy}/${timespan}`,
    );
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as TopSellingProductDTO[];
  };

  const value: DataContextType = {
    getYearlySalesData,
    getBestSellingProducts,
    getTop5ByCategory,
    getTop5BySubcategory,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContextComponent;
