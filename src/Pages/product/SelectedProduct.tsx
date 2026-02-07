import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/interfaces/ProductInterfaces";
import { Eye, ShoppingCart } from "lucide-react";

interface SelectedProductProps {
  product: Product | null;
}

/** Formats a number with European punctuation: thousands with period, decimals with comma (e.g. 10.130,53) */
function formatPrice(value: number): string {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const SelectedProduct = ({ product }: SelectedProductProps) => {
  const navigate = useNavigate();

  if (!product) {
    return (
      <Card className="h-2/6 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No product selected</p>
      </Card>
    );
  }

  const firstImage = product.images?.[0];
  const isDiscontinued = product.discontinued;

  return (
    <Card
      className={cn(
        "h-2/6 overflow-hidden grid grid-rows-7 grid-cols-3 p-2 gap-0",
        isDiscontinued &&
          "border-amber-600/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60"
      )}
    >
      <div className="col-span-2 flex items-center">
        <span className="text-xl font-bold ml-1">{product.name}</span>
        {isDiscontinued && (
          <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-300">
            (Discontinuado)
          </span>
        )}
      </div>
      <div className="row-start-2 col-span-2 flex items-center gap-2">
        <div className="h-full flex items-center gap-3 border-2 px-2">
          <span className="text-muted-foreground">Código</span>
          <span className="text-foreground">{product.code}</span>
        </div>
        {product.dimensions && (
          <div className="h-full flex items-center gap-3 border-2 px-2">
            <span className="text-muted-foreground">Dimensiones</span>
            <span className="text-foreground">{product.dimensions}</span>
          </div>
        )}
        {product.stock && (
          <div className="h-full flex items-center gap-3 border-2 px-2">
            <span className="text-muted-foreground">Stock</span>
            <div className="text-foreground">
              {product.stock.quantity} {product.saleUnitType} (
              {product.stock.measureUnitEquivalent} {product.measureType})
            </div>
          </div>
        )}
      </div>
      <div className="row-start-3 row-span-4 col-span-2 flex flex-col justify-center gap-2 pl-5">
        {product.priceByMeasureUnit && (
          <div className="text-3xl">
            $ {formatPrice(product.priceByMeasureUnit)} X {product.measureType}
          </div>
        )}
        {product.priceBySaleUnit && (
          <div className="text-2xl">
            $ {formatPrice(product.priceBySaleUnit)} X {product.saleUnitType} (
            {product.measurePerSaleUnit} {product.measureType})
          </div>
        )}
      </div>
      <div
        className="col-start-3 row-span-7 bg-secondary"
        style={{
          backgroundImage: `url(${firstImage})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="row-start-7 col-span-2 flex items-center gap-3">
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <Eye />
          Ver detalle del Producto
        </Button>
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <ShoppingCart />
          Añadir al carrito
        </Button>
      </div>
    </Card>
  );
};

export default SelectedProduct;
