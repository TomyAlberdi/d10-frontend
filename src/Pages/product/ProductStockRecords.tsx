import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProductContext } from "@/contexts/product/UseProductContext";
import { useStockLogContext } from "@/contexts/stockLog/UseStockLogContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import type { StockLog } from "@/interfaces/StockLogInterfaces";
import { ChevronLeft, Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import StockLogTable from "../stockLog/StockLogTable";

const ProductStockRecords = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useProductContext();
  const { getStockLogsByProduct } = useStockLogContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de producto no proporcionado");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getProductById(id)
      .then((fetched) => {
        if (!cancelled && fetched) setProduct(fetched);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      });

    getStockLogsByProduct(id)
      .then((result) => {
        if (!cancelled) setStockLogs(result);
      })
      .catch((err) => {
        console.error("Error fetching stock logs:", err);
        if (!cancelled) setError("Error al cargar los movimientos de stock");
        toast.error("Error al cargar los movimientos de stock");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, getProductById, getStockLogsByProduct]);

  const totals = useMemo(() => {
    let inQuantity = 0;
    let outQuantity = 0;
    for (const log of stockLogs) {
      if (log.type === "IN") inQuantity += log.saleUnitQuantity;
      else outQuantity += log.saleUnitQuantity;
    }
    return { inQuantity, outQuantity };
  }, [stockLogs]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Cargando movimientos de stock...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-lg text-destructive">{error}</div>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="bigger-icon" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-3 md:gap-5 p-3 md:p-5">
      <aside className="w-full md:w-64 shrink-0">
        <Card className="p-4 gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Package className="size-3.5" />
              Producto
            </span>
            <h2 className="text-lg font-bold leading-tight break-words">
              {product?.name ?? "—"}
            </h2>
            {product && (
              <p className="text-sm text-muted-foreground">{product.code}</p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Movimientos</p>
              <p className="text-2xl font-bold">{stockLogs.length}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                {totals.inQuantity}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Salidas</p>
              <p className="text-2xl font-bold text-red-600">
                {totals.outQuantity}
              </p>
            </div>
          </div>

          {product && (
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Stock actual</p>
              <p className="text-2xl font-bold">
                {product.stock.quantity} {product.saleUnitType}
              </p>
            </div>
          )}

          <Button variant="outline" onClick={() => navigate(-1)}>
            <ChevronLeft className="bigger-icon" />
            Volver
          </Button>
        </Card>
      </aside>

      <div className="flex-1 min-w-0 min-h-0">
        <Card className="h-full flex flex-col overflow-hidden py-0 gap-0">
          <div className="p-3 border-b shrink-0">
            <h2 className="text-lg font-semibold">
              Movimientos de stock de "{product?.name ?? "—"}"
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <StockLogTable
              stockLogs={stockLogs}
              isLoading={isLoading}
              showProduct={false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductStockRecords;
