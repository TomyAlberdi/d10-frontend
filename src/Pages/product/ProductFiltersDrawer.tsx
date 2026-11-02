import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { ProductFilters } from "@/interfaces/ProductInterfaces";
import { CATEGORIES, cn, getSubcategories } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

// Radix Select does not allow an empty value, so "no filter" gets its own.
const ALL = "__all__";

interface Draft {
  dimensions: string;
  providerName: string;
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
}

const toDraft = (filters: ProductFilters): Draft => ({
  dimensions: filters.dimensions ?? ALL,
  providerName: filters.providerName ?? ALL,
  category: filters.category ?? ALL,
  subcategory: filters.subcategory ?? ALL,
  minPrice: filters.minPrice?.toString() ?? "",
  maxPrice: filters.maxPrice?.toString() ?? "",
});

const parsePrice = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const fromDraft = (draft: Draft): ProductFilters => {
  const filters: ProductFilters = {};
  if (draft.dimensions !== ALL) filters.dimensions = draft.dimensions;
  if (draft.providerName !== ALL) filters.providerName = draft.providerName;
  if (draft.category !== ALL) filters.category = draft.category;
  if (draft.category !== ALL && draft.subcategory !== ALL) {
    filters.subcategory = draft.subcategory;
  }
  const minPrice = parsePrice(draft.minPrice);
  const maxPrice = parsePrice(draft.maxPrice);
  if (minPrice !== undefined) filters.minPrice = minPrice;
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;
  return filters;
};

/** Number of filters set, counting the price range as one. */
const countActiveFilters = (filters: ProductFilters) =>
  [
    filters.dimensions,
    filters.providerName,
    filters.category,
    filters.subcategory,
    filters.minPrice ?? filters.maxPrice,
  ].filter((v) => v !== undefined).length;

interface ProductFiltersDrawerProps {
  filters: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  /** "right" on desktop, "bottom" on mobile. */
  side: "right" | "bottom";
}

const ProductFiltersDrawer = ({
  filters,
  onApply,
  side,
}: ProductFiltersDrawerProps) => {
  const { getProviders, getDimensions } = useProductContext();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(filters));
  const [providers, setProviders] = useState<string[] | null>(null);
  const [dimensions, setDimensions] = useState<string[] | null>(null);

  const activeCount = countActiveFilters(filters);
  const minPrice = parsePrice(draft.minPrice);
  const maxPrice = parsePrice(draft.maxPrice);
  const invalidMin = draft.minPrice.trim() !== "" && minPrice === undefined;
  const invalidMax = draft.maxPrice.trim() !== "" && maxPrice === undefined;
  const invalidRange =
    minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice;
  const priceError = invalidMin || invalidMax
    ? "Ingresá un precio válido"
    : invalidRange
      ? "El precio mínimo no puede ser mayor al máximo"
      : null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    // Start from the applied filters, so closing without applying discards.
    setDraft(toDraft(filters));
    // Options are loaded on the first open only.
    if (providers === null) {
      getProviders()
        .then(setProviders)
        .catch(() => setProviders([]));
    }
    if (dimensions === null) {
      getDimensions()
        .then((list) =>
          setDimensions(
            [...list].sort((a, b) =>
              a.localeCompare(b, "es", { numeric: true }),
            ),
          ),
        )
        .catch(() => setDimensions([]));
    }
  };

  const update = (patch: Partial<Draft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const apply = () => {
    if (priceError) return;
    onApply(fromDraft(draft));
    setOpen(false);
  };

  const clear = () => {
    setDraft(toDraft({}));
    onApply({});
    setOpen(false);
  };

  const subcategories = draft.category !== ALL ? getSubcategories(draft.category) : [];
  // Keep a selected value listed even if it is no longer among the options.
  const withSelected = (options: string[] | null, selected: string) =>
    selected !== ALL && !(options ?? []).includes(selected)
      ? [selected, ...(options ?? [])]
      : (options ?? []);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant={activeCount > 0 ? "secondary" : "outline"}
          className="relative shrink-0"
          aria-label="Filtros avanzados"
        >
          <SlidersHorizontal />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <Badge className="h-4 min-w-4 px-1 tabular-nums">{activeCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={side}
        className={cn(
          "gap-0",
          side === "bottom" && "max-h-[85dvh] rounded-t-xl",
        )}
      >
        <SheetHeader className="border-b">
          <SheetTitle>Filtros avanzados</SheetTitle>
          <SheetDescription>
            Se combinan con el texto de búsqueda.
          </SheetDescription>
        </SheetHeader>

        <form
          id={`product-filters-${side}`}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <Field>
            <FieldLabel htmlFor={`filter-dimensions-${side}`}>Medida</FieldLabel>
            <Select
              value={draft.dimensions}
              onValueChange={(v) => update({ dimensions: v })}
            >
              <SelectTrigger id={`filter-dimensions-${side}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {withSelected(dimensions, draft.dimensions).map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`filter-provider-${side}`}>Fabricante</FieldLabel>
            <Select
              value={draft.providerName}
              onValueChange={(v) => update({ providerName: v })}
            >
              <SelectTrigger id={`filter-provider-${side}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {withSelected(providers, draft.providerName).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`filter-category-${side}`}>Categoría</FieldLabel>
            <Select
              value={draft.category}
              onValueChange={(v) => update({ category: v, subcategory: ALL })}
            >
              <SelectTrigger id={`filter-category-${side}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field data-disabled={draft.category === ALL || undefined}>
            <FieldLabel htmlFor={`filter-subcategory-${side}`}>
              Subcategoría
            </FieldLabel>
            <Select
              value={draft.subcategory}
              onValueChange={(v) => update({ subcategory: v })}
              disabled={draft.category === ALL}
            >
              <SelectTrigger id={`filter-subcategory-${side}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {subcategories.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`filter-min-price-${side}`}>
              Precio por unidad de venta
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id={`filter-min-price-${side}`}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="Mínimo"
                value={draft.minPrice}
                onChange={(e) => update({ minPrice: e.target.value })}
                aria-invalid={invalidMin || invalidRange || undefined}
                aria-label="Precio mínimo"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="Máximo"
                value={draft.maxPrice}
                onChange={(e) => update({ maxPrice: e.target.value })}
                aria-invalid={invalidMax || invalidRange || undefined}
                aria-label="Precio máximo"
              />
            </div>
            {priceError && (
              <p className="text-sm text-destructive">{priceError}</p>
            )}
          </Field>
        </form>

        <SheetFooter className="border-t flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={clear}
          >
            Limpiar
          </Button>
          <Button
            type="submit"
            form={`product-filters-${side}`}
            className="flex-1"
            disabled={priceError !== null}
          >
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProductFiltersDrawer;
