import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { useEffect, useState } from "react";
import ProductTablePagination from "./ProductTablePagination";
import SelectedProduct from "./SelectedProduct";

const PAGE_SIZE = 15;

const DiscontinuedProductList = () => {
  const { listDiscontinuedProducts, updateProductDiscontinued } =
    useProductContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateProductDiscontinuedLocal = (discontinued: boolean) => {
    if (!selectedProduct) return;
    updateProductDiscontinued(selectedProduct.id, discontinued).then(() => {
      setSelectedProduct({ ...selectedProduct, discontinued });
    });
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listDiscontinuedProducts(page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setProducts(result.content);
          setTotalPages(result.totalPages);
          setSelectedProduct(result.content[0] ?? null);
        }
      })
      .catch((error) => {
        console.error("Error fetching discontinued products:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listDiscontinuedProducts, page]);

  return (
    <div className="px-5 h-full flex flex-col gap-4">
      <SelectedProduct
        product={selectedProduct}
        updateProductDiscontinuedLocal={updateProductDiscontinuedLocal}
      />
      <ProductTablePagination
        products={products}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        searchInput=""
        onSearchChange={() => {}}
        isSearching={isLoading}
      />
    </div>
  );
};

export default DiscontinuedProductList;
