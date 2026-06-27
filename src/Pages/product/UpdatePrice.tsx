import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import { useProductContext } from "@/contexts/product/UseProductContext";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const UpdatePrice = () => {
  const { getProviders, updateCostsByProvider } = useProductContext();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(
    new Set(),
  );
  const [percentage, setPercentage] = useState(5);
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

  const toggleProvider = (provider: string) => {
    const newSelected = new Set(selectedProviders);
    if (newSelected.has(provider)) {
      newSelected.delete(provider);
    } else {
      newSelected.add(provider);
    }
    setSelectedProviders(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProviders.size === 0) {
      toast.error("Debe seleccionar al menos un proveedor");
      return;
    }

    setIsSubmitting(true);
    try {
      const results: Awaited<ReturnType<typeof updateCostsByProvider>>[] = [];
      for (const provider of selectedProviders) {
        const result = await updateCostsByProvider(provider, percentage);
        results.push(result);
      }
      const totalUpdated = results.reduce((acc, arr) => acc + arr.length, 0);
      toast.success(
        `${totalUpdated} producto${totalUpdated !== 1 ? "s" : ""} actualizado${
          totalUpdated !== 1 ? "s" : ""
        } correctamente`,
      );
      setSelectedProviders(new Set());
      setPercentage(5);
    } catch {
      // Error already shown by context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando proveedores…</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No hay proveedores disponibles</p>
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft className="bigger-icon" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center p-2 md:p-0">
      <Card className="p-6 max-w-2xl md:max-w-none">
        <h1 className="text-2xl font-bold mb-2">
          Actualizar precios por proveedor
        </h1>
        <p className="text-muted-foreground mb-6">
          Selecciona los proveedores e ingresa el porcentaje de cambio en los
          costos. Los precios se recalcularán automáticamente usando el margen
          de ganancia existente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldSet className="">
            <FieldLabel>Proveedores</FieldLabel>
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30 max-h-[33vh] overflow-y-auto">
              {providers.map((provider) => (
                <label
                  key={provider}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProviders.has(provider)}
                    onChange={() => toggleProvider(provider)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium">{provider}</span>
                </label>
              ))}
            </div>
          </FieldSet>

          <FieldSet className="">
            <FieldLabel>Cambio de costo (%)</FieldLabel>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  disabled={isSubmitting}
                />
                <span className="text-lg font-semibold min-w-fit">
                  {percentage > 0 ? "+" : ""}
                  {percentage}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {percentage > 0 ? "Incremento" : "Decremento"} de costos en{" "}
                {Math.abs(percentage)}%
              </p>
            </div>
          </FieldSet>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || selectedProviders.size === 0}
              className="flex-1"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar precios"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/product")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UpdatePrice;
