import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import { PencilLine, ShoppingCart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SelectedClientProps {
  client: Client | null;
}

const SelectedClient = ({ client }: SelectedClientProps) => {
  const navigate = useNavigate();
  const { cart, setCartClient } = useCartContext();
  const isCartClient =
    client && cart.client.id.length > 0 && cart.client.id === client.id;

  if (!client) {
    return (
      <Card className="h-auto md:h-[calc(100dvh-6.5rem)] p-6 flex flex-col items-center justify-center gap-3 text-center">
        <Users className="size-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Busca y selecciona un cliente para ver sus detalles
        </p>
      </Card>
    );
  }

  const typeLabel =
    client.type === "CONSUMIDOR_FINAL"
      ? "Consumidor Final"
      : "Responsable Inscripto";

  const handleSetAsCartClient = () => {
    setCartClient(client);
    toast.success("Cliente asignado al carrito", {
      action: {
        label: "Ver carrito",
        onClick: () => navigate("/cart"),
      },
    });
  };

  return (
    <Card className="h-auto md:h-[calc(100dvh-6.5rem)] overflow-hidden flex flex-col gap-4 p-4">
      {/* Name + type */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold leading-tight">{client.name}</h2>
          {isCartClient && (
            <Badge variant="secondary">Cliente del carrito</Badge>
          )}
        </div>
        <Badge className="w-fit">{typeLabel}</Badge>
      </div>

      {/* Info */}
      <div className="grid shrink-0 grid-cols-1 gap-2">
        <div className="flex flex-col rounded-md border px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {client.type === "CONSUMIDOR_FINAL" ? "DNI" : "CUIT"}
          </span>
          <span className="font-medium text-base break-words">
            {client.cuitDni || "—"}
          </span>
        </div>
        <div className="flex flex-col rounded-md border px-3 py-2">
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="font-medium text-base break-words">
            {client.email || "—"}
          </span>
        </div>
        <div className="flex flex-col rounded-md border px-3 py-2">
          <span className="text-sm text-muted-foreground">Teléfono</span>
          <span className="font-medium text-base break-words">
            {client.phone || "—"}
          </span>
        </div>
        <div className="flex flex-col rounded-md border px-3 py-2">
          <span className="text-sm text-muted-foreground">Dirección</span>
          <span className="font-medium text-base break-words">
            {client.address || "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-2">
        <Button
          size="lg"
          onClick={handleSetAsCartClient}
          disabled={!!isCartClient}
        >
          <ShoppingCart />
          {isCartClient ? "Cliente del carrito" : "Usar en carrito"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(`/client/${client.id}/update`)}
        >
          <PencilLine />
          Editar
        </Button>
      </div>
    </Card>
  );
};

export default SelectedClient;
