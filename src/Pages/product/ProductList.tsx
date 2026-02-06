import ProductTablePagination from "./ProductTablePagination";
import SelectedProduct from "./SelectedProduct";

const ProductList = () => {
  return (
    <div className="px-5 h-full">
      <SelectedProduct />
      <ProductTablePagination />
    </div>
  );
};

export default ProductList;
