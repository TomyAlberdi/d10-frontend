import type {
  CreateStockLogDTO,
  StockLog,
  StockLogContextType,
  StockLogPage,
  StockLogType,
} from "@/interfaces/StockLogInterfaces";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { StockLogContext } from "./StockLogContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/stock-log`;

/** The main page shows the last 25 movements per page. */
const STOCK_LOG_PAGE_SIZE = 25;

interface StockLogContextComponentProps {
  children: ReactNode;
}

const StockLogContextComponent: React.FC<StockLogContextComponentProps> = ({
  children,
}) => {
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [typeFilter, setTypeFilterState] = useState<StockLogType | null>(null);
  // Mirrors the filter so `fetchStockLogs` keeps a stable identity.
  const typeFilterRef = useRef<StockLogType | null>(null);

  const setTypeFilter = useCallback((type: StockLogType | null) => {
    typeFilterRef.current = type;
    setTypeFilterState(type);
  }, []);

  const fetchStockLogs = useCallback(
    async (page: number = 0, type?: StockLogType | null) => {
      const activeType = type === undefined ? typeFilterRef.current : type;
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", STOCK_LOG_PAGE_SIZE.toString());
        if (activeType) params.append("type", activeType);

        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) {
          toast.error(
            `Error al obtener movimientos de stock: ${response.status}`,
          );
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = (await response.json()) as StockLogPage;
        setStockLogs(data.content);
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch {
        // Error already handled
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getStockLogsByProduct = useCallback(async (productId: string) => {
    const response = await fetch(`${API_URL}/product/${productId}`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as StockLog[];
  }, []);

  const createStockLog = useCallback(
    async (dto: CreateStockLogDTO) => {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      });
      if (!response.ok) {
        toast.error(`Error: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      await fetchStockLogs(0);
    },
    [fetchStockLogs],
  );

  const deleteStockLog = useCallback(
    async (id: string) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error(`Error: ${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      toast.success("Movimiento de stock eliminado");
      await fetchStockLogs(currentPage);
    },
    [currentPage, fetchStockLogs],
  );

  const exportData: StockLogContextType = useMemo(
    () => ({
      stockLogs,
      pageSize: STOCK_LOG_PAGE_SIZE,
      currentPage,
      totalPages,
      totalElements,
      isLoading,
      typeFilter,
      setTypeFilter,
      fetchStockLogs,
      getStockLogsByProduct,
      createStockLog,
      deleteStockLog,
    }),
    [
      stockLogs,
      currentPage,
      totalPages,
      totalElements,
      isLoading,
      typeFilter,
      setTypeFilter,
      fetchStockLogs,
      getStockLogsByProduct,
      createStockLog,
      deleteStockLog,
    ],
  );

  return (
    <StockLogContext.Provider value={exportData}>
      {children}
    </StockLogContext.Provider>
  );
};

export default StockLogContextComponent;
