import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductContext } from "@/contexts/product/UseProductContext";
import { Check, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formatPercent = (value: number) =>
  value.toLocaleString("es-AR", { maximumFractionDigits: 2 });

const UpdatePrice = () => {
  const { getProviders, updateCostsByProvider } = useProductContext();

  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(
    new Set(),
  );
  const [percentText, setPercentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProviders()
      .then((p) => {
        if (!cancelled) setProviders(p);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getProviders]);

  const percentage = Number(percentText.replace(",", "."));
  const isPercentageValid =
    percentText.trim() !== "" &&
    Number.isFinite(percentage) &&
    percentage > 0 &&
    percentage <= 100;
  const selectedCount = selectedProviders.size;
  const canSubmit = isPercentageValid && selectedCount > 0 && !isSubmitting;

  const toggleProvider = (provider: string) => {
    setSelectedProviders((current) => {
      const next = new Set(current);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    let totalUpdated = 0;
    try {
      for (const provider of providers.filter((p) =>
        selectedProviders.has(p),
      )) {
        const updated = await updateCostsByProvider(provider, percentage);
        totalUpdated += updated.length;
        // Unselect it right away, so retrying after a later provider fails
        // doesn't raise this one twice.
        setSelectedProviders((current) => {
          const next = new Set(current);
          next.delete(provider);
          return next;
        });
      }
      setPercentText("");
    } catch {
      // Error already shown by context
    } finally {
      if (totalUpdated > 0) {
        toast.success(
          `${totalUpdated} producto${totalUpdated !== 1 ? "s" : ""} actualizado${
            totalUpdated !== 1 ? "s" : ""
          } correctamente`,
        );
      }
      setIsSubmitting(false);
    }
  };

  return (
    // Full height, so the parent layout doesn't center it vertically.
    <div className="min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-6.5rem)] flex flex-col gap-3 md:gap-4 p-3 md:p-5">
      <div>
        <h1 className="text-2xl font-bold">Precios</h1>
        <p className="text-sm text-muted-foreground">
          Aumentá los costos de uno o más proveedores. Los precios de venta se
          recalculan con el margen de ganancia de cada producto.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="py-0 gap-0">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <p className="text-sm font-medium">
              Proveedores{" "}
              <span className="font-normal text-muted-foreground">
                · {selectedCount} de {providers.length} seleccionados
              </span>
            </p>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedProviders(new Set(providers))}
                disabled={
                  isSubmitting ||
                  providers.length === 0 ||
                  selectedCount === providers.length
                }
              >
                Todos
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedProviders(new Set())}
                disabled={isSubmitting || selectedCount === 0}
              >
                Ninguno
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading &&
              Array.from({ length: 10 }, (_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            {!isLoading && providers.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                No hay proveedores disponibles
              </p>
            )}
            {providers.map((provider) => {
              const isSelected = selectedProviders.has(provider);
              return (
                <Button
                  key={provider}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  aria-pressed={isSelected}
                  title={provider}
                  onClick={() => toggleProvider(provider)}
                  disabled={isSubmitting}
                  className="justify-start"
                >
                  <span className="truncate">{provider}</span>
                  {isSelected && <Check className="ml-auto size-4" />}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center justify-between gap-3 sm:justify-start">
              <span className="text-sm font-medium">Aumento de costo</span>
              <InputGroup className="w-28">
                <InputGroupInput
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={percentText}
                  onChange={(e) => setPercentText(e.target.value)}
                  aria-invalid={percentText.trim() !== "" && !isPercentageValid}
                  disabled={isSubmitting}
                  className="text-right tabular-nums"
                />
                <InputGroupAddon align="inline-end">%</InputGroupAddon>
              </InputGroup>
            </label>
            <Button type="submit" disabled={!canSubmit}>
              <TrendingUp className="size-4" />
              {isSubmitting
                ? "Actualizando…"
                : canSubmit
                  ? `Aumentar ${formatPercent(percentage)}% a ${selectedCount} proveedor${
                      selectedCount !== 1 ? "es" : ""
                    }`
                  : "Actualizar precios"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default UpdatePrice;
