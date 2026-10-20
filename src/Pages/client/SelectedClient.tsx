import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSwapAnimation } from "@/hooks/use-motion";
import type { Client } from "@/interfaces/ClientInterfaces";
import { balanceClassName, clientTypeLabel } from "@/lib/client";
import { cn, formatPrice } from "@/lib/utils";
import { Eye, PiggyBank, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SelectedClientProps {
  client: Client | null;
}

const SelectedClient = ({ client }: SelectedClientProps) => {
  const navigate = useNavigate();
  const cardRef = useSwapAnimation<HTMLDivElement>(client?.id);

  if (!client) {
    return (
      <Card
        ref={cardRef}
        className="h-auto md:h-[calc(100dvh-6.5rem)] p-6 flex flex-col items-center justify-center gap-3 text-center"
      >
        <Users className="size-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Busca y selecciona un cliente para ver sus detalles
        </p>
      </Card>
    );
  }

  return (
    <Card
      ref={cardRef}
      className="h-auto md:h-[calc(100dvh-6.5rem)] overflow-hidden flex flex-col gap-4 p-4"
    >
      {/* Name + type */}
      <div className="flex shrink-0 flex-col gap-2">
        <h2 className="text-2xl font-bold leading-tight">{client.name}</h2>
        <Badge className="w-fit">{clientTypeLabel(client.type)}</Badge>
      </div>

      {/* Info */}
      <div className="grid shrink-0 grid-cols-1 gap-2">
        <div className="flex flex-col rounded-md border px-3 py-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <PiggyBank className="size-3.5" />
            Saldo
          </span>
          <span
            className={cn(
              "font-medium text-base break-words",
              balanceClassName(client.balance),
            )}
          >
            $ {formatPrice(client.balance)}
          </span>
        </div>
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
        <Button size="lg" onClick={() => navigate(`/client/${client.id}`)}>
          <Eye />
          Ver detalles
        </Button>
      </div>
    </Card>
  );
};

export default SelectedClient;
