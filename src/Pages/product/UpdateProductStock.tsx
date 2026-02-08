import {
  Field,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { ProductStockRecord } from "@/interfaces/ProductInterfaces";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const OPERATION_OPTIONS: ProductStockRecord["type"][] = ["IN", "OUT"];

const UpdateProductStock = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, updateProductStock } = useProductContext();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProductById>>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operation, setOperation] = useState<ProductStockRecord["type"]>("IN");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProductById(id)
      .then((p) => {
        if (!cancelled) setProduct(p);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getProductById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;

    const qty = Number(amount);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("La cantidad debe ser un número mayor que 0");
      return;
    }
    if (operation === "OUT" && product.stock.quantity < qty) {
      toast.error("Stock insuficiente. No puede sacar más unidades de las que hay en stock.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProductStock(id, { type: operation, quantity: qty });
      toast.success(
        operation === "IN"
          ? "Stock actualizado correctamente (entrada)."
          : "Stock actualizado correctamente (salida)."
      );
      const updated = await getProductById(id);
      if (updated) setProduct(updated);
      setAmount("");
    } catch {
      // Error already shown by context (e.g. insufficient stock from API)
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

  const amountNum = Number(amount);
  const isValidAmount = Number.isFinite(amountNum) && amountNum > 0;
  const measureEquivalentForAmount = isValidAmount
    ? amountNum * product.measurePerSaleUnit
    : null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Actualizar stock</h1>
      <p className="text-muted-foreground mb-4">
        {product.name} ({product.code})
      </p>

      <div className="mb-6 p-4 rounded-lg border bg-muted/50 space-y-2">
        <p className="text-sm font-medium">Stock actual</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Cantidad ({product.saleUnitType}):</span>{" "}
          {product.stock.quantity}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Equivalente en medida ({product.measureType}):</span>{" "}
          {product.stock.measureUnitEquivalent}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldSet className="grid gap-6 sm:grid-cols-2 max-w-md">
          <Field>
            <FieldLabel>Tipo de operación</FieldLabel>
            <Select
              value={operation}
              onValueChange={(v) => setOperation(v as ProductStockRecord["type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATION_OPTIONS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op === "IN" ? "Entrada" : "Salida"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Cantidad ({product.saleUnitType})</FieldLabel>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </Field>
          {measureEquivalentForAmount !== null && (
            <div className="sm:col-span-2 text-sm text-muted-foreground">
              Equivalente en medida: {measureEquivalentForAmount} {product.measureType}
            </div>
          )}
        </FieldSet>

        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Actualizando…" : "Actualizar stock"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/product")}
          >
            Volver
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProductStock;
