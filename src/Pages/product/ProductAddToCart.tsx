import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductContext } from "@/contexts/product/UseProductContext";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const ProductAddToCart = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById } = useProductContext();
  const { addProduct } = useCartContext();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saleUnitQuantity, setSaleUnitQuantity] = useState<string>("1");
  const [individualDiscountPercent, setIndividualDiscountPercent] =
    useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    getProductById(productId)
      .then((p) => {
        if (!cancelled && p) {
          setProduct(p);
          setSaleUnitQuantity("1");
          setIndividualDiscountPercent(0);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, getProductById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !productId) return;

    const qty = Number(saleUnitQuantity);
    const percent = Math.min(100, Math.max(0, individualDiscountPercent));

    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("La cantidad debe ser un número mayor que 0");
      return;
    }

    const rawSubtotal = qty * product.priceBySaleUnit;
    const individualDiscount = rawSubtotal * (percent / 100);
    const measureUnitQuantity = qty * product.measurePerSaleUnit;
    const subtotal = Math.max(0, rawSubtotal - individualDiscount);

    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      measureType: product.measureType,
      priceByMeasureUnit: product.priceByMeasureUnit,
      measureUnitQuantity,
      saleUnitType: product.saleUnitType,
      priceBySaleUnit: product.priceBySaleUnit,
      saleUnitQuantity: qty,
      individualDiscount,
      subtotal,
    };

    setIsSubmitting(true);
    try {
      addProduct(cartProduct);
      toast("Producto añadido al carrito", {
        action: {
          "label": "Ver carrito",
          "onClick": () => navigate("/cart"),
        }
      });
      navigate("/product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando producto…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/product")}>
          Volver al listado
        </Button>
      </div>
    );
  }

  const qty = Number(saleUnitQuantity);
  const percent = Math.min(100, Math.max(0, individualDiscountPercent));
  const isValidQty = Number.isFinite(qty) && qty > 0;
  const rawSubtotalPreview = isValidQty ? qty * product.priceBySaleUnit : 0;
  const subtotalPreview =
    isValidQty && rawSubtotalPreview >= 0
      ? Math.max(0, rawSubtotalPreview * (1 - percent / 100))
      : null;
  const measureTotalPreview = isValidQty
    ? qty * product.measurePerSaleUnit
    : null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Añadir al carrito</h1>
      <p className="text-muted-foreground mb-4">{product.name}</p>

      <div className="mb-6 p-4 rounded-lg border bg-muted/50 space-y-1">
        <p className="text-sm">
          <span className="text-muted-foreground">Precio por {product.saleUnitType}:</span>{" "}
          $ {formatPrice(product.priceBySaleUnit)}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Medida por {product.saleUnitType}:</span>{" "}
          {product.measurePerSaleUnit} {product.measureType}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldSet className="grid gap-6 sm:grid-cols-2 max-w-md">
          <Field>
            <FieldLabel>Cantidad ({product.saleUnitType})</FieldLabel>
            <Input
              type="number"
              min={1}
              step={1}
              value={saleUnitQuantity}
              onChange={(e) => setSaleUnitQuantity(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Descuento sobre subtotal: {percent}%</FieldLabel>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={(e) =>
                setIndividualDiscountPercent(Number(e.target.value))
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
            />
          </Field>
          {measureTotalPreview !== null && (
            <div className="sm:col-span-2 text-lg font-medium">
              Total medida: {measureTotalPreview} {product.measureType}
            </div>
          )}
          {subtotalPreview !== null && (
            <div className="sm:col-span-2 text-lg font-medium">
              Subtotal: $ {formatPrice(subtotalPreview)}
            </div>
          )}
        </FieldSet>

        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Añadiendo…" : "Añadir al carrito"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/product")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductAddToCart;
