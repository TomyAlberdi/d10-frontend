import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import type { CashRegisterType } from "@/interfaces/CashRegisterInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import {
  PAYMENT_METHOD_REGISTER_TYPE,
  REGISTER_TYPE_LABELS,
  REGISTER_TYPES,
} from "@/lib/cashRegister";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CashRegisterInvoiceTransaction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addCash, setSelectedType } = useCashRegisterContext();

  const invoice = location.state?.invoice as Invoice | undefined;

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [registerType, setRegisterTypeState] =
    useState<CashRegisterType>("PAPER");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const initialType = useMemo<CashRegisterType>(
    () =>
      invoice?.paymentMethod
        ? PAYMENT_METHOD_REGISTER_TYPE[invoice.paymentMethod]
        : "PAPER",
    [invoice],
  );

  useEffect(() => {
    if (!invoice) {
      toast.error("No se encontró la venta");
      navigate("/invoice");
      return;
    }

    // Pre-fill values
    setAmount(invoice.total.toString());
    setDescription(`venta #${invoice.invoiceNumber || invoice.id}`);
    setRegisterTypeState(initialType);
    setSelectedType(initialType);
  }, [invoice, navigate, setSelectedType, initialType]);

  const parsedAmount = Number(amount.replace(",", "."));
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isDisabled = !isValidAmount || isProcessing;

  const handleRegisterTypeChange = (type: CashRegisterType) => {
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
    <div className="min-h-full flex items-center justify-center px-3 py-3 md:px-0 md:py-0">
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

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Tipo de caja</span>
            <div className="grid grid-cols-3 gap-2">
              {REGISTER_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={registerType === type ? "default" : "outline"}
                  onClick={() => handleRegisterTypeChange(type)}
                  disabled={isProcessing}
                >
                  {REGISTER_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
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

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/invoice")}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Omitir
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full sm:flex-1"
          >
            {isProcessing ? "Registrando…" : "Registrar pago"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterInvoiceTransaction;