import { Outlet } from "react-router-dom";

const Clients = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <section className="w-full md:w-5/8 h-auto md:h-screen py-3 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Clients;
