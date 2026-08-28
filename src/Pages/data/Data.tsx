import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { RevenueBasis } from "@/interfaces/DataInterfaces";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { DataFilters } from "./useDataFilters";

const TABS = [
  { to: "/data", label: "Resumen", end: true },
  { to: "/data/caja", label: "Caja y Cobranzas", end: false },
  { to: "/data/stock", label: "Stock", end: false },
  { to: "/data/clientes", label: "Clientes", end: false },
  { to: "/data/catalogo", label: "Catálogo", end: false },
];

/**
 * Which invoice statuses count as revenue. Lives here rather than inside each
 * chart so the whole page answers one question at a time.
 */
const BASIS_OPTIONS: { value: RevenueBasis; label: string; hint: string }[] = [
  { value: "COLLECTED", label: "Cobrado", hint: "Pago, enviado y entregado" },
  { value: "DELIVERED", label: "Entregado", hint: "Suma la deuda pendiente" },
  { value: "QUOTED", label: "Presupuestado", hint: "Suma los pendientes" },
];

const Data = () => {
  const { getAvailableYears } = useDataContext();

  const [Years, setYears] = useState<number[]>([]);
  const [SelectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [Basis, setBasis] = useState<RevenueBasis>("COLLECTED");

  useEffect(() => {
    getAvailableYears().then((available) => {
      const years = available.map((entry) => entry.year);
      setYears(years);
      // Land on the most recent year that actually holds invoices.
      if (years.length > 0 && !years.includes(new Date().getFullYear())) {
        setSelectedYear(years[0]);
      }
    });
  }, [getAvailableYears]);

  const filters: DataFilters = {
    year: SelectedYear,
    basis: Basis,
    from: `${SelectedYear}-01-01`,
    to: `${SelectedYear + 1}-01-01`,
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <section className="w-full md:w-5/8 py-5 flex flex-col gap-5">
        <h1 className="text-3xl font-bold">Análisis de Datos</h1>

        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <nav className="flex flex-wrap gap-2 flex-1">
            {TABS.map((tab) => (
              <NavLink key={tab.to} to={tab.to} end={tab.end}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(isActive && "pointer-events-none")}
                  >
                    {tab.label}
                  </Button>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-wrap gap-2">
            {Years.length === 0 && (
              <Button variant="secondary" size="sm" disabled>
                {SelectedYear}
              </Button>
            )}
            {Years.map((year) => (
              <Button
                key={year}
                variant={year === SelectedYear ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-2 rounded-md px-3 py-2">
          <span className="text-sm font-medium shrink-0">
            Calcular ingresos sobre
          </span>
          <RadioGroup
            value={Basis}
            onValueChange={(value) => setBasis(value as RevenueBasis)}
            className="flex flex-wrap gap-4"
          >
            {BASIS_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`basis-${option.value}`}
                />
                <Label
                  htmlFor={`basis-${option.value}`}
                  className="cursor-pointer flex flex-col items-start gap-0"
                >
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {option.hint}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Outlet context={filters} />
      </section>
    </div>
  );
};

export default Data;
