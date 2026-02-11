import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const CashRegisterOverview = () => {
  const { currentAmount, isLoadingAmount, fetchCurrentAmount } =
    useCashRegisterContext();
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-xl p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Caja</h1>
          <p className="text-sm text-muted-foreground">
            Monto actual registrado en la caja desde el backend.
          </p>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-muted-foreground text-lg">Monto actual</span>
          {isLoadingAmount ? (
            <span className="text-4xl font-extrabold tracking-tight text-muted-foreground">
              Cargando...
            </span>
          ) : (
            <span className="text-4xl font-extrabold tracking-tight">
              $ {formatPrice(currentAmount)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/cash-register/adjust")}
          >
            Ajustar saldo
          </Button>
          <Button variant="outline" onClick={fetchCurrentAmount}>
            Actualizar monto
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterOverview;

