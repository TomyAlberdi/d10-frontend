import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Outlet } from "react-router-dom";

const Data = () => {
  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
      </section>
      <section className="w-5/8 h-screen py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Data;
