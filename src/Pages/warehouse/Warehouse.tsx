import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Outlet } from "react-router-dom";
import WarehouseMenu from "./WarehouseMenu";

const Warehouse = () => {

  return (
    <div className="min-h-screen flex items-center justify-start">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
        <WarehouseMenu />
      </section>
      <section className="w-7/8 h-screen p-3 pl-0">
        <Outlet />
      </section>
    </div>
  );
};
export default Warehouse;
