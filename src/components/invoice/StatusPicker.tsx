import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";
import { SELECTABLE_STATUSES } from "@/lib/invoice";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDIENTE: "Presupuesto",
  DEUDA: "Pago parcial",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Same colors as the status column of the invoice list. */
const STATUS_STYLES: Record<
  InvoiceStatus,
  { idle: string; active: string; dot: string }
> = {
  PENDIENTE: {
    idle: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-950/60",
    active: "bg-amber-100 dark:bg-amber-900/50 border-amber-500 ring-amber-500/30",
    dot: "bg-amber-500",
  },
  DEUDA: {
    idle: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 dark:hover:bg-orange-950/60",
    active: "bg-orange-100 dark:bg-orange-900/50 border-orange-500 ring-orange-500/30",
    dot: "bg-orange-500",
  },
  PAGO: {
    idle: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/60 hover:bg-green-100 dark:hover:bg-green-950/60",
    active: "bg-green-100 dark:bg-green-900/50 border-green-500 ring-green-500/30",
    dot: "bg-green-500",
  },
  ENVIADO: {
    idle: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-950/60",
    active: "bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-blue-500/30",
    dot: "bg-blue-500",
  },
  ENTREGADO: {
    idle: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/60",
    active: "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  CANCELADO: {
    idle: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-950/60",
    active: "bg-red-100 dark:bg-red-900/50 border-red-500 ring-red-500/30",
    dot: "bg-red-500",
  },
};

interface StatusPickerProps {
  value: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
  /** A status that is no longer picked by hand (Enviado) but the sale has. */
  extraStatus?: InvoiceStatus;
  disabled?: boolean;
}

/** One button per sale status, colored like the invoice list. */
const StatusPicker = ({
  value,
  onChange,
  extraStatus,
  disabled = false,
}: StatusPickerProps) => {
  const options =
    extraStatus && !SELECTABLE_STATUSES.includes(extraStatus)
      ? [...SELECTABLE_STATUSES, extraStatus]
      : SELECTABLE_STATUSES;

  return (
    <div
      role="radiogroup"
      aria-label="Estado de la venta"
      className="flex flex-wrap gap-2"
    >
      {options.map((status) => {
        const styles = STATUS_STYLES[status];
        const selected = value === status;
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(status)}
            className={cn(
              "flex flex-1 basis-28 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected ? cn(styles.active, "ring-3 font-semibold") : styles.idle,
            )}
          >
            <span className={cn("size-2.5 rounded-full", styles.dot)} />
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
};

export default StatusPicker;
