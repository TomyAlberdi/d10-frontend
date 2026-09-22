import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClientContext } from "@/contexts/client/UseClientContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import { formatPrice } from "@/lib/utils";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ClientBalanceAdjust = () => {
  const { id } = useParams<{ id: string }>();
  const { getClientById, addClientBalance, removeClientBalance } =
    useClientContext();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getClientById(id)
      .then((result) => {
        if (!cancelled) setClient(result);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getClientById]);

  const parsedAmount = Number(amount.replace(",", "."));
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isDisabled = !isValidAmount || isProcessing || !id;

  const handleAdd = async () => {
    if (!id || !isValidAmount) return;
    setIsProcessing(true);
    try {
      const updated = await addClientBalance(
        id,
        parsedAmount,
        description || undefined,
      );
      setClient(updated);
      setAmount("");
      setDescription("");
      toast.success("Saldo agregado correctamente");
    } catch {
      // Error handled in context
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!id || !isValidAmount) return;
    setIsProcessing(true);
    try {
      const updated = await removeClientBalance(
        id,
        parsedAmount,
        description || undefined,
      );
      setClient(updated);
      setAmount("");
      setDescription("");
      toast.success("Saldo retirado correctamente");
    } catch {
      // Error handled in context
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando cliente…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center px-3 py-3 md:px-0 md:py-0">
      <Card className="w-full max-w-xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ajustar saldo</h1>
          <p className="text-sm text-muted-foreground">
            Agrega o retira saldo manualmente de {client.name}.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 flex items-center gap-3">
          <PiggyBank className="size-6 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Saldo actual
            </p>
            <p
              className={`text-2xl font-bold ${
                client.balance > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : client.balance < 0
                    ? "text-destructive"
                    : ""
              }`}
            >
              $ {formatPrice(client.balance)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Monto a ajustar
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 1000,50"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción (opcional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Motivo del ajuste"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAdd}
            disabled={isDisabled}
            className="w-full sm:flex-1"
          >
            <TrendingUp />
            {isProcessing ? "Procesando..." : "Agregar saldo"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isDisabled}
            className="w-full sm:flex-1"
          >
            <TrendingDown />
            {isProcessing ? "Procesando..." : "Retirar saldo"}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/client")}
        >
          Volver
        </Button>
      </Card>
    </div>
  );
};

export default ClientBalanceAdjust;
