import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Button } from "@/components/ui/button";
import { CirclePlus, ListOrdered } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const Notes = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
        <Button
          onClick={() => navigate("/note")}
          className="text-lg h-16 min-w-min"
        >
          <ListOrdered className="medium-icon" />
          Lista
        </Button>
        <Button
          onClick={() => navigate("/note/create")}
          className="text-lg h-16 min-w-min"
        >
          <CirclePlus className="medium-icon" />
          Crear
        </Button>
      </section>
      <section className="w-5/8 h-screen py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Notes;
