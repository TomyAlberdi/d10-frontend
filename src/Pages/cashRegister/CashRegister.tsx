import { Button } from "@/components/ui/button";
import { CirclePlus, ReceiptText, Wallet } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const CashRegister = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <Button
          onClick={() => navigate("/cash-register")}
          className="text-lg h-16"
        >
          <Wallet className="medium-icon" />
          Resumen
        </Button>
        <Button
          onClick={() => navigate("/cash-register/adjust")}
          className="text-lg h-16"
        >
          <CirclePlus className="medium-icon" />
          Ajustar saldo
        </Button>
        <Button
          onClick={() => navigate("/cash-register/transactions")}
          className="text-lg h-16"
        >
          <ReceiptText className="medium-icon" />
          Transacciones
        </Button>
      </section>
      <section className="w-5/8 h-screen py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default CashRegister;

