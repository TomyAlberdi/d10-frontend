import BestSellingProducts from "./charts/BestSellingProducts";
import MonthlySalesChart from "./charts/MonthlySalesChart";

const MainData = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MonthlySalesChart />
      <BestSellingProducts />
    </div>
  );
};
export default MainData;
