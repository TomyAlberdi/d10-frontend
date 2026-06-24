import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Button } from "@/components/ui/button";
import { CirclePlus, ListOrdered } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const Shipments = () => {
  const navigate = useNavigate();

  return (
    <div className="h-auto md:min-h-screen flex flex-col md:flex-row items-center justify-center gap-0 md:gap-5">
      <section className="w-full md:w-1/8 flex flex-col justify-start p-3 md:p-4 gap-3">
        <FloatingGenericMenu />
        <Button
          onClick={() => navigate("/shipment")}
          className="text-lg h-16 min-w-min"
        >
          <ListOrdered className="medium-icon" />
          Lista
        </Button>
        <Button
          onClick={() => navigate("/shipment/create")}
          className="text-lg h-16 min-w-min"
        >
          <CirclePlus className="medium-icon" />
          Crear
        </Button>
      </section>
      <section className="w-full md:w-5/8 h-auto md:h-screen p-3 pb-3 md:pb-0 md:p-0 py-0 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Shipments;
