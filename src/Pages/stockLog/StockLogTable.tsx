import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockLog } from "@/interfaces/StockLogInterfaces";

const TYPE_LABELS: Record<StockLog["type"], string> = {
  IN: "Entrada",
  OUT: "Salida",
};

const TYPE_ROW_CLASSES: Record<StockLog["type"], string> = {
  IN: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40",
  OUT: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40",
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface StockLogTableProps {
  stockLogs: StockLog[];
  isLoading: boolean;
  onSelectStockLog?: (stockLog: StockLog) => void;
  /** Hidden when every row belongs to the same product. */
  showProduct?: boolean;
}

const StockLogTable = ({
  stockLogs,
  isLoading,
  onSelectStockLog,
  showProduct = true,
}: StockLogTableProps) => {
  const columnCount = showProduct ? 5 : 4;

  return (
    <Table>
      <TableHeader>
        <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
          <TableHead className="w-2/12 bg-card">Fecha y hora</TableHead>
          {showProduct && (
            <TableHead className="w-4/12 bg-card">Producto</TableHead>
          )}
          <TableHead className="w-1/12 bg-card">Tipo</TableHead>
          <TableHead className="w-2/12 bg-card">Cantidad</TableHead>
          <TableHead className="w-3/12 bg-card hidden md:table-cell">
            Detalle
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockLogs.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="text-center text-muted-foreground py-8"
            >
              {isLoading
                ? "Cargando movimientos…"
                : "No hay movimientos de stock"}
            </TableCell>
          </TableRow>
        )}
        {stockLogs.map((stockLog) => (
          <TableRow
            key={stockLog.id}
            onClick={() => onSelectStockLog?.(stockLog)}
            className={`${TYPE_ROW_CLASSES[stockLog.type] ?? ""} ${
              onSelectStockLog ? "cursor-pointer" : ""
            }`}
          >
            <TableCell>{formatDateTime(stockLog.datetime)}</TableCell>
            {showProduct && <TableCell>{stockLog.productName}</TableCell>}
            <TableCell>
              <Badge variant="secondary">
                {TYPE_LABELS[stockLog.type] ?? stockLog.type}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {stockLog.saleUnitQuantity} {stockLog.saleUnitType}
              {stockLog.measureUnitType !== stockLog.saleUnitType &&
                stockLog.measureUnitQuantity != null && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({stockLog.measureUnitQuantity} {stockLog.measureUnitType})
                  </span>
                )}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {stockLog.detail ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StockLogTable;
