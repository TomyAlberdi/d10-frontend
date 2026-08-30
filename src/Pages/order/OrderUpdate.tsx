import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOrderContext } from "@/contexts/order/UseOrderContext";
import type { Order } from "@/interfaces/OrderInterfaces";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import OrderForm from "./OrderForm";
import { formatDate } from "./orderFormat";

const OrderUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrder } = useOrderContext();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getOrderById(id)
      .then((result) => {
        if (!cancelled) setOrder(result);
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

  // A received order already added its stock, so it is only shown: it has to go
  // back to pending from the list before it can be edited.
  if (order.received) {
    return (
      <div className="h-full w-full flex justify-center items-start px-3 md:px-0 pt-4">
        <Card className="w-full md:w-2/3 flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              Pedido del {formatDate(order.date)}
            </h1>
            <Badge>Recibido</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Este pedido ya fue recibido y su stock fue cargado. Marcalo como
            pendiente desde la lista para poder editarlo.
          </p>

          <div className="border rounded-md divide-y">
            {order.products.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.productCode}
                    {product.detail ? ` · ${product.detail}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {product.saleUnitQuantity} {product.saleUnitType}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <OrderForm
      title="Editar Pedido"
      submitLabel="Guardar cambios"
      order={order}
      onSubmit={async (dto) => {
        await updateOrder(order.id, dto);
        toast.success("Pedido actualizado");
        navigate("/order");
      }}
    />
  );
};

export default OrderUpdate;
