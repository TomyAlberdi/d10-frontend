import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

const CashRegisterAdjust = () => {
  const {
    paperAmount,
    digitalAmount,
    selectedType,
    setSelectedType,
    addCash,
    removeCash,
  } = useCashRegisterContext();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const parsedAmount = Number(amount.replace(",", "."));
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isDisabled = !isValidAmount || isProcessing;

  const currentAmount = selectedType === "PAPER" ? paperAmount : digitalAmount;

  const handleAdd = async () => {
    if (!isValidAmount) return;
    setIsProcessing(true);
    try {
      await addCash(parsedAmount, description || "Ingreso manual de caja");
      setAmount("");
      setDescription("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!isValidAmount) return;
    setIsProcessing(true);
    try {
      await removeCash(parsedAmount, description || "Egreso manual de caja");
      setAmount("");
      setDescription("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ajustar caja</h1>
          <p className="text-sm text-muted-foreground">
            Agrega o retira efectivo de la caja. Los movimientos se guardan en
            el backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tipo de caja:</span>
          <Button
            variant={selectedType === "PAPER" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("PAPER")}
          >
            Efectivo
          </Button>
          <Button
            variant={selectedType === "DIGITAL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("DIGITAL")}
          >
            Transferencia
          </Button>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Monto actual</p>
          <p className="text-2xl font-semibold">
            $ {formatPrice(currentAmount)}
          </p>
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
              placeholder="Motivo del movimiento"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAdd} disabled={isDisabled}>
            {isProcessing ? "Procesando..." : "Agregar a caja"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isDisabled}
          >
            {isProcessing ? "Procesando..." : "Retirar de caja"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterAdjust;

