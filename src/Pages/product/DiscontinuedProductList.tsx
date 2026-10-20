/* eslint-disable react-hooks/set-state-in-effect */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { cn, formatPrice } from "@/lib/utils";
import { Archive, Eye, ImageOff, Route, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Divisible by 2, 3 and 4 so every grid breakpoint fills its last row.
const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

const stockText = (product: Product) =>
  product.measureType === "UNIDAD" && product.saleUnitType === "UNIDAD"
    ? `${product.stock.quantity} ${product.measureType}`
    : `${product.stock.quantity} ${product.saleUnitType} (${(
        Math.round(product.stock.measureUnitEquivalent * 100) / 100
      ).toFixed(2)} ${product.measureType})`;

interface DiscontinuedProductTileProps {
  product: Product;
  isReactivating: boolean;
  onReactivate: (product: Product) => void;
}

const DiscontinuedProductTile = ({
  product,
  isReactivating,
  onReactivate,
}: DiscontinuedProductTileProps) => {
  const navigate = useNavigate();
  const firstImage = product.images?.[0];
  const hasStock = (product.stock?.quantity ?? 0) > 0;

  return (
    <Card
      onClick={() => navigate(`/product/${product.id}`)}
      className="lift group p-0 gap-0 overflow-hidden cursor-pointer hover:shadow-md"
    >
      {/* Faded image: these products are archived, not for sale. */}
      <div className="relative aspect-[4/3] w-full border-b bg-secondary">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="h-full w-full object-contain grayscale opacity-60 transition group-hover:grayscale-0 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-8" />
          </div>
        )}
        <Badge className="absolute left-2 top-2">{product.code}</Badge>
        {product.quality && (
          <Badge variant="secondary" className="absolute right-2 top-2">
            {product.quality}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold" title={product.name}>
            {product.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {[product.providerName, product.dimensions]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Último precio</span>
            <span className="alternate-font text-muted-foreground line-through decoration-muted-foreground/50">
              {product.priceBySaleUnit
                ? `$ ${formatPrice(product.priceBySaleUnit)} X ${product.saleUnitType}`
                : "—"}
            </span>
          </div>
          {product.stock && (
            <div
              className={cn(
                "flex flex-col items-end rounded-md px-2 py-1",
                hasStock
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                  : "text-muted-foreground",
              )}
              title={
                hasStock ? "Producto eliminado con stock remanente" : undefined
              }
            >
              <span className="text-xs opacity-80">
                {hasStock ? "Stock remanente" : "Sin stock"}
              </span>
              {hasStock && (
                <span className="font-medium">{stockText(product)}</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isReactivating}
            onClick={(e) => {
              e.stopPropagation();
              onReactivate(product);
            }}
          >
            <Route />
            {isReactivating ? "Reactivando…" : "Reactivar"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Ver detalle"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
          >
            <Eye />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DiscontinuedProductList = () => {
  const { listDiscontinuedProducts, updateProductDiscontinued } =
    useProductContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  // Bumped to refetch the current page, e.g. after reactivating its last item.
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listDiscontinuedProducts(trimmedQuery || null, page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setProducts(result.content);
          setTotalPages(result.totalPages);
          setTotalElements(result.totalElements);
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
  }, [listDiscontinuedProducts, page, trimmedQuery, reloadKey]);

  const reactivate = (product: Product) => {
    setReactivatingId(product.id);
    updateProductDiscontinued(product.id, false)
      .then(() => {
        toast.success(`${product.name} reactivado`);
        const remaining = products.filter((p) => p.id !== product.id);
        setProducts(remaining);
        setTotalElements((n) => n - 1);
        // Pull the next items in rather than leaving an empty page behind.
        if (remaining.length === 0) {
          if (page > 0) setPage(page - 1);
          else setReloadKey((k) => k + 1);
        }
      })
      .catch((error) => {
        console.error("Error reactivating product:", error);
      })
      .finally(() => setReactivatingId(null));
  };

  return (
    <div className="flex flex-col gap-4 p-2 md:px-5 md:py-0">
      <header className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Archive className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">
              Productos eliminados
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading && products.length === 0
                ? "Cargando…"
                : trimmedQuery
                  ? `${totalElements} ${totalElements === 1 ? "resultado" : "resultados"} para “${trimmedQuery}”`
                  : `${totalElements} ${totalElements === 1 ? "producto discontinuado" : "productos discontinuados"}`}
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por código, nombre o fabricante"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
            aria-label="Buscar productos eliminados"
          />
        </div>
      </header>

      {isLoading && products.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Archive className="size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {trimmedQuery
              ? `Ningún producto eliminado coincide con “${trimmedQuery}”`
              : "No hay productos eliminados"}
          </p>
        </Card>
      ) : (
        <div
          className={cn(
            "stagger-in grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity",
            isLoading && "opacity-60",
          )}
        >
          {products.map((product) => (
            <DiscontinuedProductTile
              key={product.id}
              product={product}
              isReactivating={reactivatingId === product.id}
              onReactivate={reactivate}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
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
                    : "cursor-pointer"
                }
                text=""
              />
            </PaginationItem>
            <PaginationItem>
              <span>
                {page + 1} de {totalPages}
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
      )}
    </div>
  );
};

export default DiscontinuedProductList;
