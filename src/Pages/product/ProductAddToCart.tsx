import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Product } from "@/interfaces/ProductInterfaces";
import {
  canSellByMeasure,
  coverOptions,
  formatMeasure,
  parseMeasure,
  roundMeasure,
  saleUnitLabel,
} from "@/lib/measure";
import { cn, formatPrice } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CoverOptionPicker from "./CoverOptionPicker";

/** Unit the quantity is typed in: sale units, or the measure to cover. */
type QuantityMode = "sale" | "measure";

const ProductAddToCart = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById } = useProductContext();
  const { addProduct } = useCartContext();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saleUnitQuantity, setSaleUnitQuantity] = useState<string>("1");
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("sale");
  const [measureQuantity, setMeasureQuantity] = useState("");
  const [individualDiscountPercent, setIndividualDiscountPercent] =
    useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    getProductById(productId)
      .then((p) => {
        if (!cancelled && p) {
          setProduct(p);
          setSaleUnitQuantity("1");
          setQuantityMode("sale");
          setMeasureQuantity("");
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

  const handleModeChange = (mode: QuantityMode) => {
    if (!product || mode === quantityMode) return;
    if (mode === "measure") {
      // Starts at the measure of the current quantity, so switching the unit
      // does not change what is added.
      const qty = Number(saleUnitQuantity);
      setMeasureQuantity(
        Number.isFinite(qty) && qty > 0
          ? String(roundMeasure(qty * product.measurePerSaleUnit)).replace(
              ".",
              ",",
            )
          : "",
      );
    }
    setQuantityMode(mode);
    // The input is remounted for the new unit; select it to type over.
    requestAnimationFrame(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    });
  };

  const handleMeasureChange = (text: string) => {
    if (!product) return;
    setMeasureQuantity(text);
    // A new measure starts at the fewest sale units that cover it.
    const [fewest] = coverOptions(
      parseMeasure(text),
      product.measurePerSaleUnit,
    );
    setSaleUnitQuantity(fewest ? String(fewest.saleUnits) : "");
  };

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
    const measureUnitQuantity = roundMeasure(qty * product.measurePerSaleUnit);
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

    setIsSubmitting(true);
    try {
      addProduct(cartProduct);
      toast("Producto añadido al carrito", {
        action: {
          label: "Ver carrito",
          onClick: () => navigate("/cart"),
        },
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
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft className="bigger-icon" />
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

  const sellsByMeasure = canSellByMeasure(product);
  const isMeasureMode = sellsByMeasure && quantityMode === "measure";
  const requestedMeasure = parseMeasure(measureQuantity);
  const measureOptions = isMeasureMode
    ? coverOptions(requestedMeasure, product.measurePerSaleUnit)
    : [];
  const quantityModes: { mode: QuantityMode; label: string }[] = [
    { mode: "sale", label: product.saleUnitType },
    { mode: "measure", label: product.measureType },
  ];

  return (
    <div className="h-full w-full flex justify-center items-center px-3 md:px-0 pt-4 md:pt-0">
      <Card className="p-6 w-full md:max-w-md">
        <h1 className="text-2xl font-bold mb-2">Añadir al carrito</h1>
        <p className="text-muted-foreground mb-4">{product.name}</p>

        <div className="mb-6 p-4 rounded-lg border bg-muted/50 space-y-1">
          <p className="text-sm">
            <span className="text-muted-foreground">
              Precio por {product.saleUnitType}:
            </span>{" "}
            $ {formatPrice(product.priceBySaleUnit)}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">
              Medida por {product.saleUnitType}:
            </span>{" "}
            {formatMeasure(product.measurePerSaleUnit)} {product.measureType}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldSet>
            <Field>
              <FieldLabel htmlFor="quantity">
                {sellsByMeasure
                  ? "Cantidad"
                  : `Cantidad (${product.saleUnitType})`}
              </FieldLabel>
              <div className="flex gap-2">
                {isMeasureMode ? (
                  <Input
                    key="measure"
                    ref={quantityInputRef}
                    id="quantity"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={measureQuantity}
                    onChange={(e) => handleMeasureChange(e.target.value)}
                    required
                  />
                ) : (
                  <Input
                    key="sale"
                    ref={quantityInputRef}
                    id="quantity"
                    type="number"
                    min={1}
                    step={1}
                    value={saleUnitQuantity}
                    onChange={(e) => setSaleUnitQuantity(e.target.value)}
                    required
                  />
                )}
                {sellsByMeasure && (
                  <div
                    role="radiogroup"
                    aria-label="Unidad de la cantidad"
                    className="flex h-9 shrink-0 rounded-md border bg-muted p-0.5"
                  >
                    {quantityModes.map(({ mode, label }) => (
                      <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={quantityMode === mode}
                        onClick={() => handleModeChange(mode)}
                        className={cn(
                          "rounded-sm px-3 text-xs font-semibold transition-colors cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          quantityMode === mode
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isMeasureMode &&
                (measureOptions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Opciones para cubrir {formatMeasure(requestedMeasure)}{" "}
                      {product.measureType}
                    </p>
                    <CoverOptionPicker
                      options={measureOptions}
                      requested={requestedMeasure}
                      measureType={product.measureType}
                      saleUnitType={product.saleUnitType}
                      priceBySaleUnit={product.priceBySaleUnit}
                      value={qty}
                      onChange={(saleUnits) =>
                        setSaleUnitQuantity(String(saleUnits))
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ingresa los {product.measureType} a cubrir para calcular
                    la cantidad de{" "}
                    {saleUnitLabel(product.saleUnitType, 2).toLowerCase()}.
                  </p>
                ))}
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
              <div className="text-lg font-medium">
                Total medida: {formatMeasure(measureTotalPreview)}{" "}
                {product.measureType}
              </div>
            )}
            {subtotalPreview !== null && (
              <div className="text-lg font-medium">
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
      </Card>
    </div>
  );
};

export default ProductAddToCart;
