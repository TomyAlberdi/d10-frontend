import CatalogQualityChart from "./charts/CatalogQualityChart";
import ProviderPerformanceChart from "./charts/ProviderPerformanceChart";

const CatalogData = () => (
  <div className="grid grid-cols-4 gap-3">
    <ProviderPerformanceChart />
    <CatalogQualityChart />
  </div>
);

export default CatalogData;
