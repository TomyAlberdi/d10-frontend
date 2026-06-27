import { Outlet } from "react-router-dom";

const Clients = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <section className="w-full h-auto py-0 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Clients;
