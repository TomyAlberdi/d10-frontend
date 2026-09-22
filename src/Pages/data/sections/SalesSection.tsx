import { ChartColumn } from "lucide-react";
import AverageTicketChart from "../charts/AverageTicketChart";
import MonthlySalesChart from "../charts/MonthlySalesChart";
import DataSection from "../components/DataSection";

const SalesSection = () => {
  return (
    <DataSection
      title="Ventas"
      description="Ingresos y ticket promedio del año, mes a mes"
      icon={ChartColumn}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <MonthlySalesChart />
        <AverageTicketChart />
      </div>
    </DataSection>
  );
};
export default SalesSection;
