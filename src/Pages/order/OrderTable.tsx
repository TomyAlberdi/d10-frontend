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
import DownloadOrderButton from "./DownloadOrderButton";
import { formatDate } from "./orderFormat";

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onSelectOrder: (order: Order) => void;
  onReceive: (order: Order) => void;
  onRevert: (order: Order) => void;
  onDelete: (order: Order) => void;
  /** Id of the order with a request in flight, if any. */
  busyOrderId?: string | null;
}

/** Enough of the product names to recognise the order at a glance. */
const productPreview = (order: Order): string =>
  order.products.map((product) => product.productName).join(", ");

const OrderTable = ({
  orders,
  isLoading,
  onSelectOrder,
  onReceive,
  onRevert,
  onDelete,
  busyOrderId = null,
}: OrderTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
          <TableHead className="w-2/12 bg-card">Fecha</TableHead>
          <TableHead className="w-7/12 bg-card">Productos</TableHead>
          <TableHead className="w-1/12 bg-card">Estado</TableHead>
          <TableHead className="w-2/12 bg-card" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
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
              onClick={() => onSelectOrder(order)}
              className={`cursor-pointer ${
                order.received
                  ? "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40"
                  : ""
              }`}
            >
              <TableCell className="font-medium whitespace-nowrap">
                {formatDate(order.date)}
              </TableCell>
              <TableCell>
                <p className="font-medium">
                  {order.products.length} producto
                  {order.products.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-md">
                  {productPreview(order)}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant={order.received ? "default" : "secondary"}>
                  {order.received ? "Recibido" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <DownloadOrderButton order={order} />
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
