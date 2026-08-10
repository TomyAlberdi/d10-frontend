/* eslint-disable react-hooks/set-state-in-effect */
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { useEffect, useState } from "react";
import ProductTablePagination from "./ProductTablePagination";
import SelectedProduct from "./SelectedProduct";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

const DesktopProductList = () => {
  const { listProducts, updateProductDiscontinued } = useProductContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const updateProductDiscontinuedLocal = (discontinued: boolean) => {
    if (!selectedProduct) return;
    updateProductDiscontinued(selectedProduct.id, discontinued).then(() => {
      setSelectedProduct({ ...selectedProduct, discontinued });
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setIsSearching(true);
    const query = searchQuery.trim() || null;
    listProducts(query, page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setProducts(result.content);
          setTotalPages(result.totalPages);
          setSelectedProduct(result.content[0] ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listProducts, page, searchQuery]);

  return (
    <div className="px-2 md:px-5 h-full hidden md:flex flex-row gap-4">
      <div className="flex-1/3 min-w-0 h-min">
        <SelectedProduct
          product={selectedProduct}
          updateProductDiscontinuedLocal={updateProductDiscontinuedLocal}
        />
      </div>
      <div className="w-2/3 min-w-0">
        <ProductTablePagination
          products={products}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          isSearching={isSearching}
        />
      </div>
    </div>
  );
};
export default DesktopProductList;
