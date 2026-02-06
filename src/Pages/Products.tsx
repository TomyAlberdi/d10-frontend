import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const Products = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center gap-5 py-5">
      <section className="w-1/8 flex flex-col justify-start border border-red-500 p-4 gap-3">
        <Button onClick={() => navigate("/product/list")}>List</Button>
        <Button onClick={() => navigate("/product/create")}>Create</Button>
      </section>
      <section className="w-5/8 border border-red-500 overflow-auto">
        <Outlet />
      </section>
    </div>
  );
};

export default Products;