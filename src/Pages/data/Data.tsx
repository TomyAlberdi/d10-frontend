import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Button } from "@/components/ui/button";
import { ChartNoAxesCombined } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const Data = () => {

  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
        <Button
          onClick={() => navigate("/data")}
          className="text-lg h-16 min-w-min"
        >
          <ChartNoAxesCombined className="medium-icon" />
          Ventas
        </Button>
      </section>
      <section className="w-5/8 h-screen py-5">
        <h1 className="text-3xl font-bold mb-3">Análisis de Datos</h1>
        <Outlet />
      </section>
    </div>
  );
};

export default Data;
