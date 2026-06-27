import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import { formatPrice } from "@/lib/utils";
import { BanknoteArrowDown, BanknoteArrowUp } from "lucide-react";
import { useState } from "react";

const CashRegisterAdjust = () => {
  const {
    paperAmount,
    digitalAmount,
    usdAmount,
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

  const currentAmount =
    selectedType === "PAPER"
      ? paperAmount
      : selectedType === "DIGITAL"
        ? digitalAmount
        : usdAmount;

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
    <div className="min-h-full flex items-center justify-center px-3 py-3 md:px-0 md:py-0">
      <Card className="w-full max-w-xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ajustar caja</h1>
          <p className="text-sm text-muted-foreground">
            Agrega o retira efectivo de la caja. Los movimientos se guardan en
            el backend.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Tipo de caja</span>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedType === "PAPER" ? "default" : "outline"}
              onClick={() => setSelectedType("PAPER")}
            >
              Efectivo
            </Button>
            <Button
              variant={selectedType === "DIGITAL" ? "default" : "outline"}
              onClick={() => setSelectedType("DIGITAL")}
            >
              Transferencia
            </Button>
            <Button
              variant={selectedType === "USD" ? "default" : "outline"}
              onClick={() => setSelectedType("USD")}
            >
              USD
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground mb-1">Monto actual</p>
          <p className="text-2xl font-bold">$ {formatPrice(currentAmount)}</p>
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAdd}
            disabled={isDisabled}
            className="w-full sm:flex-1"
          >
            <BanknoteArrowUp />
            {isProcessing ? "Procesando..." : "Agregar a caja"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isDisabled}
            className="w-full sm:flex-1"
          >
            <BanknoteArrowDown />
            {isProcessing ? "Procesando..." : "Retirar de caja"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterAdjust;

