import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface ProductTablePaginationProps {
  products: Product[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
}

const ProductTablePagination = ({
  products,
  page,
  totalPages,
  onPageChange,
  selectedProduct,
  onSelectProduct,
}: ProductTablePaginationProps) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const selectedIndex = selectedProduct
    ? products.findIndex((p) => p.id === selectedProduct.id)
    : -1;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (products.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          selectedIndex < 0
            ? 0
            : Math.min(selectedIndex + 1, products.length - 1);
        onSelectProduct(products[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          selectedIndex < 0
            ? products.length - 1
            : Math.max(selectedIndex - 1, 0);
        onSelectProduct(products[prevIndex]);
      }
    },
    [products, selectedIndex, onSelectProduct]
  );

  return (
    <Card
      ref={tableRef}
      className="h-4/6 flex flex-col overflow-y-scroll py-0"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">Código</TableHead>
            <TableHead className="w-2/12">Fabricante</TableHead>
            <TableHead className="w-4/12">Nombre</TableHead>
            <TableHead className="w-3/12">Precio Unitario</TableHead>
            <TableHead className="w-2/12">Dimensiones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              data-state={
                selectedProduct?.id === product.id ? "selected" : undefined
              }
              onClick={() => onSelectProduct(product)}
              className="cursor-pointer"
            >
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.providerName}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {product.priceBySaleUnit && (
                  <>
                    $ {formatPrice(product.priceBySaleUnit)} X{" "}
                    {product.saleUnitType}
                  </>
                )}
              </TableCell>
              <TableCell>{product.dimensions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 0) onPageChange(page - 1);
              }}
              aria-disabled={page <= 0}
              className={
                page <= 0 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
              text=""
            />
          </PaginationItem>
          <PaginationItem>
            <span>
              {page + 1} de {totalPages || 1}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages - 1) onPageChange(page + 1);
              }}
              aria-disabled={page >= totalPages - 1}
              className={
                page >= totalPages - 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
              text=""
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Card>
  );
};

export default ProductTablePagination;
