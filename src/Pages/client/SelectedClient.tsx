import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import { PencilLine, ShoppingCart } from "lucide-react";
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
      <Card className="h-2/6 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No client selected</p>
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
    <Card className="h-2/6 overflow-hidden grid grid-cols-5 grid-rows-4 gap-1 p-2">
      <div className="col-span-4 flex items-center">
        <span className="text-xl font-bold ml-1">{client.name}</span>
        {isCartClient && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (Cliente del carrito)
          </span>
        )}
      </div>
      <div className="col-span-2 row-start-2 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Tipo</span>
        <span className="text-foreground">{typeLabel}</span>
      </div>
      <div className="col-span-2 row-start-2 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Email</span>
        <span className="text-foreground">{client.email}</span>
      </div>
      <div className="col-span-2 row-start-3 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">
          {client.type === "CONSUMIDOR_FINAL" ? "DNI" : "CUIT"}
        </span>
        <span className="text-foreground">{client.cuitDni}</span>
      </div>
      <div className="col-span-2 row-start-3 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Teléfono</span>
        <span className="text-foreground">{client.phone}</span>
      </div>
      <div className="col-span-2 row-start-4 flex items-center gap-3 border-2 px-2 w-full">
        <span className="text-muted-foreground">Dirección</span>
        <span className="text-foreground">{client.address}</span>
      </div>
      <div className="col-span-1 row-span-full flex flex-col justify-between">
        <Button
          className="h-[49%] w-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/client/${client.id}/update`)}
        >
          <PencilLine />
          Editar
        </Button>
        <Button
          className="h-[49%] w-full"
          variant="outline"
          size="sm"
          onClick={handleSetAsCartClient}
          disabled={!!isCartClient}
        >
          <ShoppingCart />
          {isCartClient ? "Cliente del carrito" : "Usar en carrito"}
        </Button>
      </div>
    </Card>
  );
};

export default SelectedClient;
