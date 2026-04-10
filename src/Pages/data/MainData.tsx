import MonthlySalesChart from "./charts/MonthlySalesChart";

const MainData = () => {
  return (
    <div className="grid grid-cols-4 gap-3 border border-red-500">
      <MonthlySalesChart />
    </div>
  );
};
export default MainData;
