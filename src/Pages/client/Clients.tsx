import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Button } from "@/components/ui/button";
import { CirclePlus, ListOrdered } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const Clients = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-start md:justify-center gap-0 md:gap-5">
      <section className="w-full md:w-1/8 flex flex-col justify-start p-2 pb-0 md:p-4 md:pb-2 gap-2 md:gap-3">
        <FloatingGenericMenu />
        <Button
          onClick={() => navigate("/client")}
          className="text-lg h-16 min-w-min"
        >
          <ListOrdered className="medium-icon" />
          Lista
        </Button>
        <Button
          onClick={() => navigate("/client/create")}
          className="text-lg h-16 min-w-min"
        >
          <CirclePlus className="medium-icon" />
          Crear
        </Button>
      </section>
      <section className="w-full md:w-5/8 h-auto md:h-screen py-3 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Clients;
