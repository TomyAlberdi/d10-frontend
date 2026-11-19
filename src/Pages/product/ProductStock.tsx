import { cn } from "@/lib/utils";
import StockLogsList from "@/Pages/stockLog/StockLogsList";
import { ArrowDownUp, Package } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ProductStockList from "./ProductStockList";

type StockView = "list" | "movements";

const PAGE_SHELL =
  "h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col gap-3 md:gap-4 p-3 md:p-5";

// The view lives in the URL so each tab can be linked to and the browser's
// back button moves between them.
const VIEWS: {
  value: StockView;
  label: string;
  search: string;
  icon: typeof Package;
}[] = [
  { value: "list", label: "Existencias", search: "", icon: Package },
  {
    value: "movements",
    label: "Movimientos",
    search: "?view=movements",
    icon: ArrowDownUp,
  },
];

const ProductStock = () => {
  const [searchParams] = useSearchParams();
  const view: StockView =
    searchParams.get("view") === "movements" ? "movements" : "list";

  return (
    <div className={PAGE_SHELL}>
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold">Stock</h1>
        <nav className="flex gap-1 border-b" aria-label="Vistas de stock">
          {VIEWS.map((option) => {
            const isActive = option.value === view;
            return (
              <Link
                key={option.value}
                to={{ search: option.search }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px flex flex-1 md:flex-none items-center justify-center gap-2 rounded-t-md border-b-[3px] px-5 py-2.5 text-base font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <option.icon className="size-5" />
                {option.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {view === "movements" ? <StockLogsList /> : <ProductStockList />}
    </div>
  );
};

export default ProductStock;
