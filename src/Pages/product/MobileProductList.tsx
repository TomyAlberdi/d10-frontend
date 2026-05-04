/* eslint-disable react-hooks/set-state-in-effect */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import {
  ChevronDown,
  Eye,
  PackagePlus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 300;

const MobileProductList = () => {
  const navigate = useNavigate();
  const { listProducts } = useProductContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
    <div className="flex md:hidden flex-col h-auto p-2 gap-2">
      <Card className="flex flex-row items-center gap-2 p-2">
        <Input
          type="search"
          placeholder="Buscar productos"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
          aria-label="Buscar productos"
        />
        {isSearching && (
          <span className="text-sm text-muted-foreground">Buscando…</span>
        )}
        <Search className="size-4 text-muted-foreground shrink-0" />
      </Card>
      {products.map((product) => (
        <Card key={product.id} className="p-2 gap-2">
          <section className="flex flex-col justify-start gap-2">
            <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
            <div className="flex gap-2">
              <Badge>Código {product.code}</Badge>
              {product.quality && (
                <Badge variant={"secondary"}>{product.quality}</Badge>
              )}
              {product.discontinued && (
                <Badge variant="destructive">Discontinuado</Badge>
              )}
            </div>
          </section>
          <section className="flex flex-col justify-start gap-2">
            {product.dimensions && (
              <div className="flex items-center gap-3 border-2 p-2">
                <span className="text-muted-foreground">Dimensiones</span>
                <span className="text-foreground">{product.dimensions}</span>
              </div>
            )}
            {product.stock && (
              <div
                className={
                  "flex items-center gap-3 border-2 p-2 " +
                  (product.stock.quantity > 0 ? "" : " border border-red-500")
                }
              >
                <span className="text-muted-foreground">Stock</span>
                {product.measureType === "UNIDAD" &&
                product.saleUnitType === "UNIDAD" ? (
                  <div className="text-foreground">
                    {product.stock.quantity} {product.measureType}
                  </div>
                ) : (
                  <div className="text-foreground">
                    {product.stock.quantity} {product.saleUnitType} (
                    {(
                      Math.round(product.stock.measureUnitEquivalent * 100) /
                      100
                    ).toFixed(2)}{" "}
                    {product.measureType})
                  </div>
                )}
              </div>
            )}
          </section>
          <section className="flex flex-col justify-center items-center gap-2 px-5">
            {product.priceByMeasureUnit && (
              <div className="text-2xl alternate-font">
                $ {formatPrice(product.priceByMeasureUnit)} X{" "}
                {product.measureType}
              </div>
            )}
            {product.priceBySaleUnit && (
              <div className="text-xl alternate-font">
                $ {formatPrice(product.priceBySaleUnit)} X{" "}
                {product.saleUnitType} ({product.measurePerSaleUnit}{" "}
                {product.measureType})
              </div>
            )}
          </section>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Acciones
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem
                className="bg-accent"
                onClick={() => navigate(`/product/add/${product.id}`)}
              >
                <ShoppingCart />
                Añadir al carrito
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-accent"
                onClick={() => navigate(`/product/${product.id}/stock`)}
              >
                <PackagePlus />
                Actualizar stock
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-accent"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <Eye />
                Ver detalle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      ))}
      <Pagination className="shrink-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 0) setPage(page - 1);
              }}
              aria-disabled={page <= 0}
              className={
                page <= 0
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer border"
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
                if (page < totalPages - 1) setPage(page + 1);
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
    </div>
  );
};
export default MobileProductList;
