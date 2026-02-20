import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const CashRegisterOverview = () => {
  const { paperAmount, digitalAmount, isLoadingAmount, fetchCurrentAmounts } =
    useCashRegisterContext();
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-xl p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Caja</h1>
          <p className="text-sm text-muted-foreground">
            Montos actuales registrados en las cajas.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-muted-foreground text-lg">Caja Efectivo:</span>
            {isLoadingAmount ? (
              <span className="text-2xl font-extrabold tracking-tight text-muted-foreground">
                Cargando...
              </span>
            ) : (
              <span className="text-2xl font-extrabold tracking-tight">
                $ {formatPrice(paperAmount)}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-muted-foreground text-lg">Caja Transferencia:</span>
            {isLoadingAmount ? (
              <span className="text-2xl font-extrabold tracking-tight text-muted-foreground">
                Cargando...
              </span>
            ) : (
              <span className="text-2xl font-extrabold tracking-tight">
                $ {formatPrice(digitalAmount)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/cash-register/adjust")}
          >
            Ajustar saldo
          </Button>
          <Button variant="outline" onClick={fetchCurrentAmounts}>
            Actualizar montos
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterOverview;

