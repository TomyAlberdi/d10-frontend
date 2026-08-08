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
import { CirclePlus, PackageCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DownloadOrdersButton from "./DownloadOrdersButton";
import OrderTable from "./OrderTable";
import ReceiveOrdersDialog from "./ReceiveOrdersDialog";

const ALL_DATES = "all";

type StatusFilter = "PENDING" | "RECEIVED" | "ALL";

const STATUS_LABELS: Record<StatusFilter, string> = {
  PENDING: "Pendientes",
  RECEIVED: "Recibidos",
  ALL: "Todos",
};

/** `yyyy-MM-dd` → `dd/MM/yyyy`. */
const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
};

const OrdersList = () => {
  const navigate = useNavigate();
  const {
    getOrders,
    getOrderDates,
    updateOrderReceived,
    receiveOrdersByDate,
    deleteOrder,
  } = useOrderContext();

  const [orders, setOrders] = useState<Order[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  // Orders waiting for the "add to stock" confirmation: one row, or a whole batch.
  const [pendingReceive, setPendingReceive] = useState<Order[] | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  // Every order of the batch is loaded and filtered client side, so the pending
  // count stays accurate no matter which status the user is looking at.
  const loadOrders = useCallback(
    async (date: string | null) => {
      setIsLoading(true);
      try {
        setOrders(await getOrders({ date }));
      } catch {
        // Error already reported by the context
      } finally {
        setIsLoading(false);
      }
    },
    [getOrders],
  );

  const loadDates = useCallback(async (): Promise<string[]> => {
    try {
      const result = await getOrderDates();
      setDates(result);
      return result;
    } catch {
      return [];
    }
  }, [getOrderDates]);

  // On mount the most recent batch is the one worth looking at.
  useEffect(() => {
    let cancelled = false;
    loadDates().then((result) => {
      if (cancelled) return;
      const initialDate = result[0] ?? null;
      setSelectedDate(initialDate);
      loadOrders(initialDate);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (value: string) => {
    const date = value === ALL_DATES ? null : value;
    setSelectedDate(date);
    loadOrders(date);
  };

  const refresh = async () => {
    const refreshedDates = await loadDates();
    // Deleting the last order of a batch removes its date from the selector, so
    // the view falls back to the most recent batch that is still there.
    const date =
      selectedDate && !refreshedDates.includes(selectedDate)
        ? (refreshedDates[0] ?? null)
        : selectedDate;
    if (date !== selectedDate) setSelectedDate(date);
    await loadOrders(date);
  };

  const pendingOrders = orders.filter((order) => !order.received);
  const visibleOrders = orders.filter((order) => {
    if (status === "PENDING") return !order.received;
    if (status === "RECEIVED") return order.received;
    return true;
  });

  const handleConfirmReceive = async () => {
    if (!pendingReceive || pendingReceive.length === 0) return;
    setIsReceiving(true);
    try {
      // A whole batch goes through the bulk endpoint, which validates every
      // product before moving any stock.
      if (pendingReceive.length > 1 && selectedDate) {
        await receiveOrdersByDate(selectedDate);
        toast.success(
          `${pendingReceive.length} pedidos recibidos. Stock actualizado.`,
        );
      } else {
        await updateOrderReceived(pendingReceive[0].id, true);
        toast.success("Pedido recibido. Stock actualizado.");
      }
      setPendingReceive(null);
      await refresh();
    } catch {
      // Error already reported by the context
    } finally {
      setIsReceiving(false);
    }
  };

  const handleRevert = async (order: Order) => {
    const confirmed = window.confirm(
      `¿Volver el pedido de "${order.productName}" a pendiente? Se van a descontar ${order.saleUnitQuantity} ${order.saleUnitType} del stock actual.`,
    );
    if (!confirmed) return;
    setBusyOrderId(order.id);
    try {
      await updateOrderReceived(order.id, false);
      toast.success("Pedido marcado como pendiente. Stock descontado.");
      await refresh();
    } catch {
      // Error already reported by the context
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`¿Eliminar el pedido de "${order.productName}"?`))
      return;
    setBusyOrderId(order.id);
    try {
      await deleteOrder(order.id);
      toast.success("Pedido eliminado");
      await refresh();
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
            {selectedDate
              ? `Pedido del ${formatDate(selectedDate)}`
              : "Todos los pedidos"}{" "}
            · {pendingOrders.length} pendiente
            {pendingOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedDate ?? ALL_DATES}
            onValueChange={handleDateChange}
          >
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_DATES}>Todas las fechas</SelectItem>
              {dates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <DownloadOrdersButton orders={visibleOrders} date={selectedDate} />

          {selectedDate && pendingOrders.length > 0 && (
            <Button onClick={() => setPendingReceive(pendingOrders)}>
              <PackageCheck className="w-4 h-4 mr-2" />
              Recibir pedido
            </Button>
          )}

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
            showDate={selectedDate === null}
            busyOrderId={busyOrderId}
            onSelectOrder={(order) => navigate(`/order/${order.id}`)}
            onReceive={(order) => setPendingReceive([order])}
            onRevert={handleRevert}
            onDelete={handleDelete}
          />
        </div>
      </Card>

      <ReceiveOrdersDialog
        orders={pendingReceive ?? []}
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
