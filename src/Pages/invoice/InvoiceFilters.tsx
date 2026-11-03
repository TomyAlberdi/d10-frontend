import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Presupuesto",
  PAGO: "Pago",
  DEUDA: "Deuda",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const STATUS_DOT: Record<string, string> = {
  PENDIENTE: "bg-amber-500",
  PAGO: "bg-green-500",
  DEUDA: "bg-orange-500",
  ENTREGADO: "bg-emerald-500",
  CANCELADO: "bg-red-500",
};

export interface InvoiceFilterValues {
  status: Invoice["status"] | null;
  stockNotDecreased: boolean;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_INVOICE_FILTERS: InvoiceFilterValues = {
  status: null,
  stockNotDecreased: false,
  dateFrom: "",
  dateTo: "",
};

/** Number of filters set, counting the date range as one. */
const countActiveFilters = (filters: InvoiceFilterValues) =>
  [
    filters.stockNotDecreased,
    filters.status !== null,
    filters.dateFrom !== "" || filters.dateTo !== "",
  ].filter(Boolean).length;

interface InvoiceFiltersPanelProps {
  value: InvoiceFilterValues;
  onChange: (patch: Partial<InvoiceFilterValues>) => void;
  /** Keeps the input ids unique when the panel is rendered more than once. */
  idPrefix: string;
}

/** The filter controls, shared by the desktop sidebar and the mobile drawer. */
export const InvoiceFiltersPanel = ({
  value,
  onChange,
  idPrefix,
}: InvoiceFiltersPanelProps) => {
  const { status, stockNotDecreased, dateFrom, dateTo } = value;

  return (
    <>
      <label className="flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors hover:bg-accent/50">
        <Checkbox
          checked={stockNotDecreased}
          onCheckedChange={(v) => onChange({ stockNotDecreased: v === true })}
        />
        <span>Sin retirar</span>
      </label>

      <Separator />

      <div className="flex flex-col gap-1">
        <h4 className="px-2 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Estado
        </h4>
        <button
          type="button"
          onClick={() => onChange({ status: null })}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors",
            status === null ? "bg-accent font-medium" : "hover:bg-accent/50",
          )}
        >
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          Todos
        </button>
        {Object.entries(STATUS_LABELS).map(([s, label]) => (
          <button
            key={s}
            type="button"
            disabled={stockNotDecreased}
            onClick={() => onChange({ status: s as Invoice["status"] })}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors",
              status === s ? "bg-accent font-medium" : "hover:bg-accent/50",
              stockNotDecreased && "opacity-40 pointer-events-none",
            )}
          >
            <span className={cn("size-2.5 rounded-full", STATUS_DOT[s])} />
            {label}
          </button>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h4 className="flex items-center justify-between px-2 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Fecha
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => onChange({ dateFrom: "", dateTo: "" })}
              className="normal-case font-normal text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </button>
          )}
        </h4>
        <div className="flex flex-col gap-2 px-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`${idPrefix}-date-from`}
              className="text-xs text-muted-foreground"
            >
              Desde
            </label>
            <Input
              id={`${idPrefix}-date-from`}
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              disabled={stockNotDecreased}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`${idPrefix}-date-to`}
              className="text-xs text-muted-foreground"
            >
              Hasta
            </label>
            <Input
              id={`${idPrefix}-date-to`}
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              disabled={stockNotDecreased}
              onChange={(e) => onChange({ dateTo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </>
  );
};

interface InvoiceFiltersDrawerProps {
  filters: InvoiceFilterValues;
  onApply: (filters: InvoiceFilterValues) => void;
  className?: string;
}

/** Mobile filters: a button that opens the panel in a bottom drawer. */
export const InvoiceFiltersDrawer = ({
  filters,
  onApply,
  className,
}: InvoiceFiltersDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  const activeCount = countActiveFilters(filters);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Start from the applied filters, so closing without applying discards.
    if (next) setDraft(filters);
  };

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const clear = () => {
    setDraft(EMPTY_INVOICE_FILTERS);
    onApply(EMPTY_INVOICE_FILTERS);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant={activeCount > 0 ? "secondary" : "outline"}
          className={cn("relative shrink-0", className)}
          aria-label="Filtros"
        >
          <SlidersHorizontal />
          {activeCount > 0 && (
            <Badge className="h-4 min-w-4 px-1 tabular-nums">{activeCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="gap-0 max-h-[85dvh] rounded-t-xl">
        <SheetHeader className="border-b">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Se combinan con el texto de búsqueda.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <InvoiceFiltersPanel
            value={draft}
            onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
            idPrefix="invoice-filters-drawer"
          />
        </div>

        <SheetFooter className="border-t flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={clear}
          >
            Limpiar
          </Button>
          <Button type="button" className="flex-1" onClick={apply}>
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
