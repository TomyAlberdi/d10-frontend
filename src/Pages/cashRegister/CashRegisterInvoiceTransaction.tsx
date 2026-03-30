import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CashRegisterInvoiceTransaction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addCash, setSelectedType } = useCashRegisterContext();

  const invoice = location.state?.invoice as Invoice | undefined;

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [registerType, setRegisterTypeState] = useState<"PAPER" | "DIGITAL">("PAPER");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!invoice) {
      toast.error("No se encontró la venta");
      navigate("/invoice");
      return;
    }

    // Pre-fill values
    setAmount(invoice.total.toString());
    setDescription(`venta #${invoice.invoiceNumber || invoice.id}`);
    const initialType = invoice.paymentMethod === "DIGITAL" ? "DIGITAL" : "PAPER";
    setRegisterTypeState(initialType);
    setSelectedType(initialType);
  }, [invoice, navigate, setSelectedType]);

  const parsedAmount = Number(amount.replace(",", "."));
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isDisabled = !isValidAmount || isProcessing;

  const handleRegisterTypeChange = (type: "PAPER" | "DIGITAL") => {
    setRegisterTypeState(type);
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!isValidAmount || !invoice) return;
    setIsProcessing(true);
    try {
      await addCash(parsedAmount, description || `venta #${invoice.invoiceNumber || invoice.id}`);
      toast.success("Transacción registrada correctamente");
      navigate("/invoice");
    } catch {
      // Error handled in context
    } finally {
      setIsProcessing(false);
    }
  };

  if (!invoice) {
    return null;
  }

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Registrar pago en caja</h1>
          <p className="text-sm text-muted-foreground">
            Registra el pago de la venta en la caja.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              venta
            </label>
            <p className="text-sm text-muted-foreground">
              #{invoice.invoiceNumber || invoice.id} - {invoice.client.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tipo de caja:</span>
            <Button
              variant={registerType === "PAPER" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRegisterTypeChange("PAPER")}
              disabled={isProcessing}
            >
              Efectivo
            </Button>
            <Button
              variant={registerType === "DIGITAL" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRegisterTypeChange("DIGITAL")}
              disabled={isProcessing}
            >
              Transferencia
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto
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
              Descripción
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la transacción"
              disabled={isProcessing}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="flex-1"
          >
            {isProcessing ? "Registrando…" : "Registrar pago"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/invoice")}
            disabled={isProcessing}
          >
            Omitir
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterInvoiceTransaction;