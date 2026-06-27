import { Outlet } from "react-router-dom";

const Data = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <section className="w-full md:w-5/8 h-auto md:h-screen py-5">
        <h1 className="text-3xl font-bold mb-3">Análisis de Datos</h1>
        <Outlet />
      </section>
    </div>
  );
};

export default Data;
