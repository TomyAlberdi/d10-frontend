import type { StockLogType } from "@/interfaces/StockLogInterfaces";
import { cn } from "@/lib/utils";

interface StockLogTypeFilterProps {
  value: StockLogType | null;
  onChange: (type: StockLogType | null) => void;
  disabled?: boolean;
}

const OPTIONS: { value: StockLogType | null; label: string; dot: string }[] = [
  { value: null, label: "Todos", dot: "bg-muted-foreground/40" },
  { value: "IN", label: "Entradas", dot: "bg-green-500" },
  { value: "OUT", label: "Salidas", dot: "bg-red-500" },
];

const StockLogTypeFilter = ({
  value,
  onChange,
  disabled = false,
}: StockLogTypeFilterProps) => {
  return (
    <div className="flex items-center gap-1 rounded-md border p-1 bg-card w-full md:w-auto">
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-1 md:flex-none items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            value === option.value
              ? "bg-accent font-medium"
              : "hover:bg-accent/50",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          <span className={cn("size-2.5 rounded-full", option.dot)} />
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default StockLogTypeFilter;
