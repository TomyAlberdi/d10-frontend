import { Outlet } from "react-router-dom";
import { CURRENT_YEAR } from "./components/format";

const Data = () => {
  return (
    <div className="min-h-screen w-full px-4 py-6 md:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out motion-reduce:animate-none">
          <h1 className="text-3xl font-bold">Análisis de Datos</h1>
          <p className="text-muted-foreground">
            Ventas y productos del año {CURRENT_YEAR}
          </p>
        </header>
        <Outlet />
      </section>
    </div>
  );
};

export default Data;
