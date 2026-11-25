import { Card } from "@/components/ui/card";
import { useStockLogContext } from "@/contexts/stockLog/UseStockLogContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StockLogPagination from "./StockLogPagination";
import StockLogTable from "./StockLogTable";
import StockLogTypeFilter from "./StockLogTypeFilter";

const StockLogsList = () => {
  const navigate = useNavigate();
  const {
    stockLogs,
    pageSize,
    currentPage,
    totalPages,
    totalElements,
    isLoading,
    typeFilter,
    setTypeFilter,
    fetchStockLogs,
  } = useStockLogContext();

  // Reloads the first page on mount and whenever the IN/OUT filter changes.
  useEffect(() => {
    fetchStockLogs(0, typeFilter);
  }, [fetchStockLogs, typeFilter]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Últimos {pageSize} movimientos por página · {totalElements} en total
        </p>
        <StockLogTypeFilter
          value={typeFilter}
          onChange={setTypeFilter}
          disabled={isLoading}
        />
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden py-0 gap-0">
        <div className="flex-1 overflow-y-auto">
          <StockLogTable
            stockLogs={stockLogs}
            isLoading={isLoading}
            onSelectStockLog={(stockLog) =>
              navigate(`/product/${stockLog.productId}`)
            }
          />
        </div>
        <StockLogPagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchStockLogs(page)}
          disabled={isLoading}
        />
      </Card>
    </>
  );
};

export default StockLogsList;
