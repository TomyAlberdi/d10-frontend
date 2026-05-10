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
import { ChevronDown, Eye, PackagePlus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 15;

const MobileDiscontinuedProductList = () => {
  const navigate = useNavigate();
  const { listDiscontinuedProducts, updateProductDiscontinued } =
    useProductContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const updateProductDiscontinuedLocal = (
    product: Product,
    discontinued: boolean,
  ) => {
    updateProductDiscontinued(product.id, discontinued).then(() => {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, discontinued } : p)),
      );
    });
  };

  useEffect(() => {
    let cancelled = false;
    listDiscontinuedProducts(page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setProducts(result.content);
          setTotalPages(result.totalPages);
        }
      })
      .catch((error) => {
        console.error("Error fetching discontinued products:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [listDiscontinuedProducts, page]);

  return (
    <div className="flex md:hidden flex-col h-auto p-2 gap-2">
      {products.map((product) => (
        <Card key={product.id} className="p-2 gap-2">
          <section className="flex flex-col justify-start gap-2">
            <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
            <div className="flex gap-2">
              <Badge>Código {product.code}</Badge>
              {product.quality && (
                <Badge variant={"secondary"}>{product.quality}</Badge>
              )}
              <Badge variant="destructive">Discontinuado</Badge>
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
              <DropdownMenuItem
                className="bg-accent"
                onClick={() => updateProductDiscontinuedLocal(product, false)}
              >
                Reactivar producto
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

export default MobileDiscontinuedProductList;
