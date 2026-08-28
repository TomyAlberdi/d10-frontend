import DeadStockTable from "./charts/DeadStockTable";
import StockTurnoverChart from "./charts/StockTurnoverChart";
import StockValuationChart from "./charts/StockValuationChart";

const StockData = () => (
  <div className="grid grid-cols-4 gap-3">
    <StockValuationChart />
    <StockTurnoverChart />
    <DeadStockTable />
  </div>
);

export default StockData;
