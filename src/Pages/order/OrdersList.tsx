import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderContext } from "@/contexts/order/UseOrderContext";
import type { Order } from "@/interfaces/OrderInterfaces";
import { CirclePlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import OrderTable from "./OrderTable";
import ReceiveOrderDialog from "./ReceiveOrderDialog";
import { formatDate } from "./orderFormat";

type StatusFilter = "PENDING" | "RECEIVED" | "ALL";

const STATUS_LABELS: Record<StatusFilter, string> = {
  PENDING: "Pendientes",
  RECEIVED: "Recibidos",
  ALL: "Todos",
};

const OrdersList = () => {
  const navigate = useNavigate();
  const { getOrders, updateOrderReceived, deleteOrder } = useOrderContext();

  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  // Order waiting for the "add to stock" confirmation.
  const [pendingReceive, setPendingReceive] = useState<Order | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  // Every order is loaded and filtered client side, so the pending count stays
  // accurate no matter which status the user is looking at.
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      setOrders(await getOrders());
    } catch {
      // Error already reported by the context
    } finally {
      setIsLoading(false);
    }
  }, [getOrders]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingOrders = orders.filter((order) => !order.received);
  const visibleOrders = orders.filter((order) => {
    if (status === "PENDING") return !order.received;
    if (status === "RECEIVED") return order.received;
    return true;
  });

  const handleConfirmReceive = async () => {
    if (!pendingReceive) return;
    setIsReceiving(true);
    try {
      await updateOrderReceived(pendingReceive.id, true);
      toast.success("Pedido recibido. Stock actualizado.");
      setPendingReceive(null);
      await loadOrders();
    } catch {
      // Error already reported by the context
    } finally {
      setIsReceiving(false);
    }
  };

  const handleRevert = async (order: Order) => {
    const confirmed = window.confirm(
      `¿Volver el pedido del ${formatDate(order.date)} a pendiente? Se van a descontar del stock actual las cantidades de sus ${order.products.length} producto(s).`,
    );
    if (!confirmed) return;
    setBusyOrderId(order.id);
    try {
      await updateOrderReceived(order.id, false);
      toast.success("Pedido marcado como pendiente. Stock descontado.");
      await loadOrders();
    } catch {
      // Error already reported by the context
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`¿Eliminar el pedido del ${formatDate(order.date)}?`))
      return;
    setBusyOrderId(order.id);
    try {
      await deleteOrder(order.id);
      toast.success("Pedido eliminado");
      await loadOrders();
    } catch {
      // Error already reported by the context
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col gap-3 md:gap-4 p-3 md:p-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {pendingOrders.length} pendiente
            {pendingOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {STATUS_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => navigate("/order/create")}>
            <CirclePlus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden py-0 gap-0">
        <div className="flex-1 overflow-y-auto">
          <OrderTable
            orders={visibleOrders}
            isLoading={isLoading}
            busyOrderId={busyOrderId}
            onSelectOrder={(order) => navigate(`/order/${order.id}`)}
            onReceive={(order) => setPendingReceive(order)}
            onRevert={handleRevert}
            onDelete={handleDelete}
          />
        </div>
      </Card>

      <ReceiveOrderDialog
        order={pendingReceive}
        open={pendingReceive !== null}
        onOpenChange={(open) => {
          if (!open && !isReceiving) setPendingReceive(null);
        }}
        onConfirm={handleConfirmReceive}
        isSubmitting={isReceiving}
      />
    </div>
  );
};

export default OrdersList;
