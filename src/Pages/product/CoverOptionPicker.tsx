import type { Product } from "@/interfaces/ProductInterfaces";
import { formatMeasure, saleUnitLabel, type CoverOption } from "@/lib/measure";
import { cn, formatPrice } from "@/lib/utils";

interface CoverOptionPickerProps {
  options: CoverOption[];
  /** Measure the client asked for. */
  requested: number;
  measureType: Product["measureType"];
  saleUnitType: Product["saleUnitType"];
  priceBySaleUnit: number;
  /** Sale units picked. */
  value: number;
  onChange: (saleUnits: number) => void;
}

const formatPercent = (value: number) =>
  value.toLocaleString("es-ES", { maximumFractionDigits: 1 });

/**
 * One card per number of sale units that covers the measure asked for, with
 * the measure they add up to, the surplus and the price. The bar of each card
 * splits its measure into the part asked for and the surplus, on a scale
 * shared by the cards so their surpluses compare at a glance.
 */
const CoverOptionPicker = ({
  options,
  requested,
  measureType,
  saleUnitType,
  priceBySaleUnit,
  value,
  onChange,
}: CoverOptionPickerProps) => {
  const scale = Math.max(...options.map((o) => o.measure));

  return (
    <div
      role="radiogroup"
      aria-label={`Cantidad de ${saleUnitLabel(saleUnitType, 2).toLowerCase()}`}
      className="grid gap-2"
    >
      {options.map((option) => {
        const selected = option.saleUnits === value;
        const exact = option.surplus === 0;
        return (
          <button
            key={option.saleUnits}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.saleUnits)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/60",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected ? "border-primary bg-primary" : "border-input",
              )}
            >
              {selected && (
                <span className="size-1.5 rounded-full bg-primary-foreground" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">
                  <span className="text-lg tabular-nums">
                    {option.saleUnits}
                  </span>{" "}
                  <span className="text-xs tracking-wide">
                    {saleUnitLabel(saleUnitType, option.saleUnits)}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">
                  $ {formatPrice(option.saleUnits * priceBySaleUnit)}
                </span>
              </span>
              <span className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground tabular-nums">
                  {formatMeasure(option.measure)} {measureType}
                  {exact ? (
                    " · sin excedente"
                  ) : (
                    <>
                      {" · "}
                      <span className="text-amber-700 dark:text-amber-400">
                        +{formatMeasure(option.surplus)} {measureType} extra
                      </span>
                    </>
                  )}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                    exact
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                  )}
                >
                  {exact ? "Exacto" : `+${formatPercent(option.surplusPercent)}%`}
                </span>
              </span>
              <span
                aria-hidden
                className="flex h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className={cn(
                    "h-full transition-colors",
                    selected ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  style={{
                    width: `${(Math.min(requested, option.measure) / scale) * 100}%`,
                  }}
                />
                <span
                  className="h-full bg-amber-500"
                  style={{ width: `${(option.surplus / scale) * 100}%` }}
                />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CoverOptionPicker;
