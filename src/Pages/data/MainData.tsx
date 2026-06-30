import { Button } from "@/components/ui/button";
import { useState } from "react";
import ClientsChart from "./charts/ClientsChart";
import MonthlyExpensesChart from "./charts/MonthlyExpensesChart";
import MonthlySalesChart from "./charts/MonthlySalesChart";

const MainData = () => {
  const [SelectedYear, setSelectedYear] = useState(2026);

  return (
    <div className="grid grid-cols-4 gap-3">
      <MonthlySalesChart SelectedYear={SelectedYear} />
      <div className="flex flex-col items-center gap-3 col-span-1">
        <h3 className="text-xl font-semibold">Seleccionar Año</h3>
        <Button
          className="w-full"
          variant={"secondary"}
          onClick={() => setSelectedYear(2026)}
        >
          2026
        </Button>
      </div>
      <MonthlyExpensesChart SelectedYear={SelectedYear} />
      <ClientsChart SelectedYear={SelectedYear} />
    </div>
  );
};
export default MainData;
