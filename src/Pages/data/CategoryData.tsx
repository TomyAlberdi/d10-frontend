import TopSellingByCategory from "./charts/TopSellingByCategory";

const CategoryData = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="col-span-4 flex gap-3">
        <TopSellingByCategory />
      </div>
    </div>
  );
};
export default CategoryData;
