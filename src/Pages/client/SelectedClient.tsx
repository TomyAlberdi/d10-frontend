import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import { PencilLine, ShoppingCart } from "lucide-react";
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
    client.type === "FISICA" ? "Persona física" : "Persona jurídica";

  const handleSetAsCartClient = () => {
    setCartClient(client);
    toast.success("Cliente asignado al carrito");
  };

  return (
    <Card className="h-2/6 overflow-hidden flex flex-col gap-1 p-2">
      <div className="col-span-2 flex items-center h-1/6">
        <span className="text-xl font-bold ml-1">{client.name}</span>
        {isCartClient && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (Cliente del carrito)
          </span>
        )}
      </div>
      <div className="h-1/6 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Tipo</span>
        <span className="text-foreground">{typeLabel}</span>
      </div>
      <div className="flex items-center gap-3 border-2 px-2 h-1/6">
        <span className="text-muted-foreground">Email</span>
        <span className="text-foreground">{client.email}</span>
      </div>
      <div className="h-1/6 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">
          {client.type === "FISICA" ? "DNI" : "CUIT"}
        </span>
        <span className="text-foreground">{client.cuitDni}</span>
      </div>
      <div className="h-1/6 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Teléfono</span>
        <span className="text-foreground">{client.phone}</span>
      </div>
      <div className="h-1/6 flex items-center gap-3 border-2 px-2 w-full">
        <span className="text-muted-foreground">Dirección</span>
        <span className="text-foreground">{client.address}</span>
      </div>
      <div className="h-1/6 flex items-center gap-3 flex-wrap">
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={handleSetAsCartClient}
          disabled={!!isCartClient}
        >
          <ShoppingCart />
          {isCartClient ? "Cliente del carrito" : "Usar en carrito"}
        </Button>
        <Button
          className="h-full"
          variant="outline"
          size="sm"
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
