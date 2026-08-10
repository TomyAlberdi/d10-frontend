import { Outlet } from "react-router-dom";

const CashRegister = () => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center">
      <section className="w-full h-auto py-0 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default CashRegister;
