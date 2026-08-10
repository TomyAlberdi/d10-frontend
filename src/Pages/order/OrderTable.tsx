import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/interfaces/OrderInterfaces";
import { PackageCheck, RotateCcw, Trash2 } from "lucide-react";

/** `yyyy-MM-dd` → `dd/MM/yyyy`. */
const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
};

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  /** Hidden when every row belongs to the same batch. */
  showDate?: boolean;
  onSelectOrder?: (order: Order) => void;
  onReceive: (order: Order) => void;
  onRevert: (order: Order) => void;
  onDelete: (order: Order) => void;
  /** Id of the order with a request in flight, if any. */
  busyOrderId?: string | null;
}

const OrderTable = ({
  orders,
  isLoading,
  showDate = true,
  onSelectOrder,
  onReceive,
  onRevert,
  onDelete,
  busyOrderId = null,
}: OrderTableProps) => {
  const columnCount = showDate ? 6 : 5;

  return (
    <Table>
      <TableHeader>
        <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
          <TableHead className="w-2/12 bg-card">Código</TableHead>
          <TableHead className="w-5/12 bg-card">Producto</TableHead>
          <TableHead className="w-2/12 bg-card">Cantidad</TableHead>
          {showDate && (
            <TableHead className="w-1/12 bg-card hidden md:table-cell">
              Fecha
            </TableHead>
          )}
          <TableHead className="w-1/12 bg-card">Estado</TableHead>
          <TableHead className="w-1/12 bg-card" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="text-center text-muted-foreground py-8"
            >
              {isLoading ? "Cargando pedidos…" : "No hay pedidos"}
            </TableCell>
          </TableRow>
        )}
        {orders.map((order) => {
          const isBusy = busyOrderId === order.id;
          return (
            <TableRow
              key={order.id}
              onClick={() => !order.received && onSelectOrder?.(order)}
              className={`${
                order.received
                  ? "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40"
                  : ""
              } ${onSelectOrder && !order.received ? "cursor-pointer" : ""}`}
            >
              <TableCell className="font-medium">
                {order.productCode || "—"}
              </TableCell>
              <TableCell>
                <p>{order.productName}</p>
                {order.detail && (
                  <p className="text-xs text-muted-foreground">
                    {order.detail}
                  </p>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {order.saleUnitQuantity} {order.saleUnitType}
              </TableCell>
              {showDate && (
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatDate(order.orderDate)}
                </TableCell>
              )}
              <TableCell>
                <Badge variant={order.received ? "default" : "secondary"}>
                  {order.received ? "Recibido" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {order.received ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Volver a pendiente y descontar el stock"
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevert(order);
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Marcar como recibido"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReceive(order);
                        }}
                      >
                        <PackageCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar pedido"
                        className="text-destructive hover:text-destructive"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(order);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
