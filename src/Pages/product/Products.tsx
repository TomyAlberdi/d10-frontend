import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { CirclePlus, ListOrdered, Package, XCircle } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

const Products = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-0 md:gap-5">
      <section className="w-full md:w-1/8 flex flex-col justify-start p-2 md:p-4 gap-2 md:gap-3">
        <FloatingGenericMenu />
        <Button
          onClick={() => navigate("/product")}
          className="text-lg h-16 min-w-min"
        >
          <ListOrdered className="medium-icon" />
          Lista
        </Button>
        <Button
          onClick={() => navigate("/product/stock")}
          className="text-lg h-16 min-w-min"
        >
          <Package className="medium-icon" />
          Stock
        </Button>
        <Button
          onClick={() => navigate("/product/discontinued")}
          className="text-lg h-16 min-w-min"
        >
          <XCircle className="medium-icon" />
          Eliminados
        </Button>
        <Button
          onClick={() => navigate("/product/create")}
          className="text-lg h-16 min-w-min"
        >
          <CirclePlus className="medium-icon" />
          Crear
        </Button>
      </section>
      <section className="w-full md:w-5/8 h-screen py-0 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Products;
