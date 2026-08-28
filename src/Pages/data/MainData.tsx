import BestSellingProducts from "./charts/BestSellingProducts";
import CategoryRevenueChart from "./charts/CategoryRevenueChart";
import KpiSummaryStrip from "./charts/KpiSummaryStrip";
import MonthlySalesComparison from "./charts/MonthlySalesComparison";
import PaymentMethodChart from "./charts/PaymentMethodChart";

const MainData = () => (
  <div className="grid grid-cols-4 gap-3">
    <KpiSummaryStrip />
    <MonthlySalesComparison />
    <CategoryRevenueChart />
    <PaymentMethodChart />
    <BestSellingProducts />
  </div>
);

export default MainData;
