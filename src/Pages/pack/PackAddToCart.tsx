import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { usePackContext } from "@/contexts/pack/UsePackContext";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Pack, PackItem } from "@/interfaces/PackInterfaces";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type ItemEntry = {
  packItem: PackItem;
  product: Product | null;
  notFound: boolean;
  saleUnitQuantity: string;
  discountPercent: number;
};

const PackAddToCart = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPackById } = usePackContext();
  const { getProductById } = useProductContext();
  const { addProduct } = useCartContext();

  const [pack, setPack] = useState<Pack | null>(null);
  const [entries, setEntries] = useState<ItemEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const fetchedPack = await getPackById(id);
        if (!fetchedPack) {
          toast.error("Pack no encontrado");
          navigate("/product/packs");
          return;
        }
        setPack(fetchedPack);

        const resolved = await Promise.all(
          fetchedPack.items.map(async (item) => {
            try {
              const product = await getProductById(item.productId);
              return {
                packItem: item,
                product,
                notFound: product === null,
                saleUnitQuantity: String(item.quantity),
                discountPercent: 0,
              } satisfies ItemEntry;
            } catch {
              return {
                packItem: item,
                product: null,
                notFound: true,
                saleUnitQuantity: String(item.quantity),
                discountPercent: 0,
              } satisfies ItemEntry;
            }
          })
        );
        setEntries(resolved);
      } catch (error) {
        toast.error("Error al cargar el pack");
        console.error(error);
        navigate("/product/packs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getPackById, getProductById, navigate]);

  const updateEntry = (productId: string, changes: Partial<ItemEntry>) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.packItem.productId === productId ? { ...e, ...changes } : e
      )
    );
  };

  const getSubtotal = (entry: ItemEntry): number => {
    if (!entry.product) return 0;
    const qty = parseFloat(entry.saleUnitQuantity);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    const rawSubtotal = qty * entry.product.priceBySaleUnit;
    return Math.max(0, rawSubtotal * (1 - entry.discountPercent / 100));
  };

  const getGrandTotal = () =>
    entries.reduce((sum, e) => sum + getSubtotal(e), 0);

  const handleAddAllToCart = () => {
    const validEntries = entries.filter(
      (e) =>
        e.product !== null &&
        !e.notFound &&
        Number.isFinite(parseFloat(e.saleUnitQuantity)) &&
        parseFloat(e.saleUnitQuantity) > 0
    );

    if (validEntries.length === 0) {
      toast.error("No hay productos válidos para agregar al carrito");
      return;
    }

    setSubmitting(true);
    try {
      for (const entry of validEntries) {
        const product = entry.product!;
        const qty = parseFloat(entry.saleUnitQuantity);
        const rawSubtotal = qty * product.priceBySaleUnit;
        const individualDiscount =
          rawSubtotal * (entry.discountPercent / 100);
        const measureUnitQuantity = parseFloat(
          (qty * product.measurePerSaleUnit).toFixed(2)
        );
        const subtotal = Math.max(0, rawSubtotal - individualDiscount);

        const cartProduct: CartProduct = {
          id: product.id,
          name: product.name,
          measureType: product.measureType,
          priceByMeasureUnit: product.priceByMeasureUnit,
          measureUnitQuantity,
          saleUnitType: product.saleUnitType,
          priceBySaleUnit: product.priceBySaleUnit,
          dimensions: product.dimensions,
          saleUnitQuantity: qty,
          individualDiscount,
          subtotal,
          measurePerSaleUnit: product.measurePerSaleUnit,
        };

        addProduct(cartProduct);
      }

      toast(`${validEntries.length} producto(s) agregado(s) al carrito`, {
        action: {
          label: "Ver carrito",
          onClick: () => navigate("/cart"),
        },
      });
      navigate("/product/packs");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center px-3 md:px-0 pt-4 md:pt-0">
        <Card className="w-full md:w-1/2 flex flex-col gap-4 p-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </Card>
      </div>
    );
  }

  if (!pack) return null;

  const availableEntries = entries.filter((e) => !e.notFound && e.product);
  const missingEntries = entries.filter((e) => e.notFound || !e.product);

  return (
    <div className="h-full w-full flex justify-center items-center px-3 md:px-0 pt-4 md:pt-0">
      <Card className="w-full md:w-1/2 flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Enviar al carrito</h1>
          <p className="text-muted-foreground">{pack.name}</p>
        </div>
      </div>

      {missingEntries.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-md border border-destructive/50 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {missingEntries.length} producto(s) no se pudieron cargar y serán
            omitidos:{" "}
            {missingEntries.map((e) => e.packItem.productName).join(", ")}.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {availableEntries.map((entry) => {
          const product = entry.product!;
          const qty = parseFloat(entry.saleUnitQuantity);
          const isValidQty = Number.isFinite(qty) && qty > 0;
          const subtotal = getSubtotal(entry);

          return (
            <div
              key={entry.packItem.productId}
              className="flex flex-col gap-3 p-4 border rounded-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    $ {formatPrice(product.priceBySaleUnit)} /{" "}
                    {product.saleUnitType}
                  </p>
                </div>
                <Badge variant="secondary">{product.saleUnitType}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Cantidad ({product.saleUnitType})
                  </label>
                  <Input
                    type="number"
                    min="0.01"
                    step="any"
                    value={entry.saleUnitQuantity}
                    onChange={(e) =>
                      updateEntry(entry.packItem.productId, {
                        saleUnitQuantity: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Descuento: {entry.discountPercent}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={entry.discountPercent}
                    onChange={(e) =>
                      updateEntry(entry.packItem.productId, {
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary mt-2"
                  />
                </div>
              </div>

              {isValidQty && (
                <div className="flex justify-between text-sm pt-1 border-t">
                  <span className="text-muted-foreground">
                    {qty * product.measurePerSaleUnit} {product.measureType}
                  </span>
                  <span className="font-medium">
                    Subtotal: $ {formatPrice(subtotal)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {availableEntries.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t font-semibold text-base">
          <span>Total estimado</span>
          <span>$ {formatPrice(getGrandTotal())}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleAddAllToCart}
          disabled={submitting || availableEntries.length === 0}
          className="w-full sm:w-auto"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {submitting
            ? "Agregando..."
            : `Agregar ${availableEntries.length} producto(s) al carrito`}
        </Button>
      </div>
      </Card>
    </div>
  );
};

export default PackAddToCart;
