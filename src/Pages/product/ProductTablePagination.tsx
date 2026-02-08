import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";
import { useCallback, useRef } from "react";

interface ProductTablePaginationProps {
  products: Product[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
}

const ProductTablePagination = ({
  products,
  page,
  totalPages,
  onPageChange,
  selectedProduct,
  onSelectProduct,
  searchInput,
  onSearchChange,
  isSearching = false,
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
      className="h-4/6 flex flex-col overflow-hidden py-0 gap-0"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="p-3 border-b shrink-0 flex items-center gap-2">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <Input
          type="search"
          placeholder="Buscar por código, nombre o fabricante"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
          aria-label="Buscar productos"
        />
        {isSearching && (
          <span className="text-sm text-muted-foreground">Buscando…</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
              <TableHead className="w-1/12 bg-card">Código</TableHead>
              <TableHead className="w-2/12 bg-card">Fabricante</TableHead>
              <TableHead className="w-4/12 bg-card">Nombre</TableHead>
              <TableHead className="w-3/12 bg-card">Precio Unitario</TableHead>
              <TableHead className="w-2/12 bg-card">Dimensiones</TableHead>
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
      </div>
      <Pagination className="mt-auto shrink-0">
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
