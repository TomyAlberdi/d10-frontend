import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@/interfaces/ProductInterfaces";
import { cn, formatPrice } from "@/lib/utils";
import {
  ImageOff,
  Info,
  PackagePlus,
  PencilLine,
  Route,
  RouteOff,
  ShoppingCart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SelectedProductProps {
  product: Product | null;
  updateProductDiscontinuedLocal: (discontinued: boolean) => void;
}

const SelectedProduct = ({
  product,
  updateProductDiscontinuedLocal,
}: SelectedProductProps) => {
  const navigate = useNavigate();

  if (!product) {
    return (
      <Card className="h-[calc(100dvh-6.5rem)] p-6 flex flex-col items-center justify-center gap-3 text-center">
        <ImageOff className="size-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Selecciona un producto de la lista para ver sus detalles
        </p>
      </Card>
    );
  }

  const firstImage = product.images?.[0];
  const isDiscontinued = product.discontinued;

  const stockText =
    product.measureType === "UNIDAD" && product.saleUnitType === "UNIDAD"
      ? `${product.stock?.quantity} ${product.measureType}`
      : `${product.stock?.quantity} ${product.saleUnitType} (${(
          Math.round((product.stock?.measureUnitEquivalent ?? 0) * 100) / 100
        ).toFixed(2)} ${product.measureType})`;

  return (
    <Card
      className={cn(
        "h-[calc(100dvh-6.5rem)] overflow-hidden flex flex-col gap-4 p-4",
        isDiscontinued &&
          "border-amber-600/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60",
      )}
    >
      {/* Image (flexes to fill the leftover height) */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-lg border bg-secondary">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-10" />
          </div>
        )}
      </div>

      {/* Title + badges */}
      <div className="flex shrink-0 flex-col gap-2">
        <h2 className="text-2xl font-bold leading-tight">{product.name}</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Código {product.code}</Badge>
          {product.quality && (
            <Badge variant="secondary">{product.quality}</Badge>
          )}
          {isDiscontinued && <Badge variant="destructive">Discontinuado</Badge>}
        </div>
      </div>

      {/* Prices */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        {product.priceByMeasureUnit && (
          <div className="text-3xl alternate-font">
            $ {formatPrice(product.priceByMeasureUnit)}{" "}
            <span className="text-lg text-muted-foreground">
              X {product.measureType}
            </span>
          </div>
        )}
        {product.priceBySaleUnit && (
          <div className="text-lg text-muted-foreground alternate-font">
            $ {formatPrice(product.priceBySaleUnit)} X {product.saleUnitType} (
            {product.measurePerSaleUnit} {product.measureType})
          </div>
        )}
      </div>

      {/* Dimensions + Stock */}
      <div className="grid shrink-0 grid-cols-2 gap-2">
        {product.dimensions && (
          <div className="flex flex-col rounded-md border px-3 py-2">
            <span className="text-sm text-muted-foreground">Dimensiones</span>
            <span className="font-medium text-lg">{product.dimensions}</span>
          </div>
        )}
        {product.stock && (
          <div
            className={cn(
              "flex flex-col rounded-md border px-3 py-2",
              product.stock.quantity <= 0 && "border-red-500",
            )}
          >
            <span className="text-sm text-muted-foreground">Stock</span>
            <span className="font-medium text-lg">{stockText}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col shrink-0 grid-cols-2 gap-2 pt-2">
        <Button
          size="lg"
          onClick={() => navigate(`/product/add/${product.id}`)}
        >
          <ShoppingCart />
          Añadir al carrito
        </Button>
        <Button size="lg" onClick={() => navigate(`/product/${product.id}`)} variant="secondary">
          <Info />
          Ver detalles
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(`/product/${product.id}/update`)}
        >
          <PencilLine />
          Editar
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(`/product/${product.id}/stock`)}
        >
          <PackagePlus />
          Actualizar stock
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => updateProductDiscontinuedLocal(!product.discontinued)}
        >
          {product.discontinued ? (
            <>
              <Route />
              Reactivar
            </>
          ) : (
            <>
              <RouteOff />
              Discontinuar
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default SelectedProduct;
