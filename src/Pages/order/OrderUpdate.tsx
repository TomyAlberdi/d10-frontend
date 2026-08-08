import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrderContext } from "@/contexts/order/UseOrderContext";
import type { Order } from "@/interfaces/OrderInterfaces";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const OrderUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrder } = useOrderContext();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getOrderById(id)
      .then((result) => {
        if (cancelled || !result) return;
        setOrder(result);
        setQuantity(String(result.saleUnitQuantity));
        setOrderDate(result.orderDate);
        setDetail(result.detail ?? "");
      })
      .catch(() => {
        // Error already reported by the context
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !id) return;

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("La cantidad debe ser un número entero mayor a 0");
      return;
    }
    if (!orderDate) {
      toast.error("Elegí la fecha del pedido");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrder(id, {
        productId: order.productId,
        saleUnitQuantity: parsedQuantity,
        orderDate,
        detail: detail.trim() || undefined,
      });
      toast.success("Pedido actualizado");
      navigate("/order");
    } catch {
      // Error already reported by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando pedido…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 flex flex-col items-start gap-3">
        <p className="text-muted-foreground">Pedido no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/order")}>
          Volver a pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-start px-3 md:px-0 pt-4">
      <Card className="w-full md:w-1/2 flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Editar Pedido</h1>
        </div>

        <div className="p-4 rounded-lg border bg-muted/50 space-y-1">
          <p className="font-medium">{order.productName}</p>
          <p className="text-sm text-muted-foreground">
            {order.productCode}
            {order.providerName ? ` · ${order.providerName}` : ""}
          </p>
        </div>

        {order.received && (
          <p className="text-sm text-muted-foreground">
            Este pedido ya fue recibido y su stock fue cargado. Marcalo como
            pendiente desde la lista para poder editarlo.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">
                Cantidad ({order.saleUnitType})
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={order.received}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="orderDate">Fecha del pedido</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                disabled={order.received}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="detail">Detalle (opcional)</Label>
            <Input
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Por ejemplo: confirmar color con el proveedor"
              disabled={order.received}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || order.received}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OrderUpdate;
