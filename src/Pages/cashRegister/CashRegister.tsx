import { Outlet } from "react-router-dom";

const CashRegister = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <section className="w-full md:w-5/8 h-auto md:h-screen p-3 md:p-0 py-0 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default CashRegister;
