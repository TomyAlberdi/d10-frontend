import type { DataContextType, MonthlySummaryRecord } from "@/interfaces/DataInterfaces";
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

  const value: DataContextType = {
    getYearlySalesData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContextComponent;
