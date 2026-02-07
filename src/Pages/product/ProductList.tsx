import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { useEffect, useState } from "react";
import ProductTablePagination from "./ProductTablePagination";
import SelectedProduct from "./SelectedProduct";

const PAGE_SIZE = 15;

const ProductList = () => {
  const { listProducts } = useProductContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    listProducts(null, page, PAGE_SIZE).then((result) => {
      setProducts(result.content);
      setTotalPages(result.totalPages);
      setSelectedProduct(result.content[0] ?? null);
    });
  }, [listProducts, page]);

  return (
    <div className="px-5 h-full flex flex-col gap-4">
      <SelectedProduct product={selectedProduct} />
      <ProductTablePagination
        products={products}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
      />
    </div>
  );
};

export default ProductList;
