import { CirclePlus, ListOrdered } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

const Products = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <Button
          onClick={() => navigate("/product")}
          className="text-lg h-16"
        >
          <ListOrdered className="medium-icon" />
          Listar
        </Button>
        <Button
          onClick={() => navigate("/product/create")}
          className="text-lg h-16"
        >
          <CirclePlus className="medium-icon" />
          Crear
        </Button>
      </section>
      <section className="w-5/8 h-screen py-5 overflow-auto">
        <Outlet />
      </section>
    </div>
  );
};

export default Products;
