import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@/interfaces/ProductInterfaces";
import { cn, formatPrice } from "@/lib/utils";
import {
  PackagePlus,
  PencilLine,
  Route,
  RouteOff,
  ShoppingCart,
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
        "h-2/6 overflow-hidden grid grid-rows-7 grid-cols-3 p-2 gap-1",
        isDiscontinued &&
          "border-amber-600/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60",
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
        {product.quality && (
          <div className="h-full flex items-center gap-3 border-2 px-2">
            <span className="text-foreground">
              {product.quality === "PRIMERA" ? "1RA" : "2DA"}
            </span>
            <span className="text-muted-foreground">Calidad</span>
          </div>
        )}
        {product.dimensions && (
          <div className="h-full flex items-center gap-3 border-2 px-2">
            <span className="text-muted-foreground">Dimensiones</span>
            <span className="text-foreground">{product.dimensions}</span>
          </div>
        )}
        {product.stock && (
          <div
            className={
              "h-full flex items-center gap-3 border-2 px-2" +
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
                {product.stock.measureUnitEquivalent} {product.measureType})
              </div>
            )}
          </div>
        )}
      </div>
      <div className="row-start-3 row-span-1 col-span-2 flex items-center gap-2">
        {product.category && (
          <div className="h-full flex items-center border-2 px-2 text-foreground">
            {product.category}
          </div>
        )}
        {product.subcategory && (
          <div className="h-full flex items-center border-2 px-2 text-foreground">
            {product.subcategory}
          </div>
        )}
      </div>
      <div className="row-start-4 row-span-3 col-span-2 flex flex-col justify-center gap-2 pl-5">
        {product.priceByMeasureUnit && (
          <div className="text-3xl alternate-font">
            $ {formatPrice(product.priceByMeasureUnit)} X {product.measureType}
          </div>
        )}
        {product.priceBySaleUnit && (
          <div className="text-2xl alternate-font">
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
        {/*         <Button
          className="h-full"
          disabled
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <Eye />
          Ver detalle
        </Button> */}
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/add/${product.id}`)}
        >
          <ShoppingCart />
          Añadir al carrito
        </Button>
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${product.id}/update`)}
        >
          <PencilLine />
          Editar
        </Button>
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${product.id}/stock`)}
        >
          <PackagePlus />
          Actualizar stock
        </Button>
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => {
            updateProductDiscontinuedLocal(!product.discontinued);
          }}
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
