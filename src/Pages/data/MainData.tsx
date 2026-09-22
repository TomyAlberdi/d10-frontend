import ExtraSection from "./sections/ExtraSection";
import ProductsSection from "./sections/ProductsSection";
import SalesSection from "./sections/SalesSection";

/**
 * The data page reads the current year only. The yearly summary leads so the
 * headline figures are visible without scrolling; the charts behind them come
 * after, sales first and then the product breakdown.
 */
const MainData = () => {
  return (
    <div className="flex flex-col gap-10">
      <ExtraSection />
      <SalesSection />
      <ProductsSection />
    </div>
  );
};
export default MainData;
