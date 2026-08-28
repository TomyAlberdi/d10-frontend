import MonthlyExpensesChart from "./charts/MonthlyExpensesChart";
import ReceivablesAgingChart from "./charts/ReceivablesAgingChart";
import TopDebtorsTable from "./charts/TopDebtorsTable";

const CashData = () => (
  <div className="grid grid-cols-4 gap-3">
    <ReceivablesAgingChart />
    <TopDebtorsTable />
    <MonthlyExpensesChart />
  </div>
);

export default CashData;
