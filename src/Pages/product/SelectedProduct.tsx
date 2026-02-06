import { useNavigate } from "react-router-dom";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/interfaces/ProductInterfaces";

interface SelectedProductProps {
  product: Product | null;
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
        "h-2/6 overflow-hidden flex flex-col",
        isDiscontinued &&
          "border-amber-600/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/60",
      )}
    >
      <div className="flex flex-1 min-h-0 p-4 gap-4">
        {firstImage && (
          <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="col-span-2 font-medium">
            <span
              className={cn(
                isDiscontinued && "text-amber-800 dark:text-amber-200",
              )}
            >
              {product.name}
            </span>
            {isDiscontinued && (
              <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-300">
                (Discontinued)
              </span>
            )}
          </div>
          <span className="text-muted-foreground">Code</span>
          <span className="text-foreground">{product.code}</span>
          <span className="text-muted-foreground">Measure type</span>
          <span className="text-foreground">{product.measureType}</span>
          <span className="text-muted-foreground">Measure price</span>
          <span className="text-foreground">{product.priceByMeasureUnit}</span>
          <span className="text-muted-foreground">Sale unit type</span>
          <span className="text-foreground">{product.saleUnitType}</span>
          <span className="text-muted-foreground">Sale unit price</span>
          <span className="text-foreground">{product.priceBySaleUnit}</span>
          <span className="text-muted-foreground">Measure per sale unit</span>
          <span className="text-foreground">{product.measurePerSaleUnit}</span>
        </div>
      </div>
      <CardFooter className="p-4 pt-0 border-t shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View complete product page
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SelectedProduct;
