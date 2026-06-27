import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { cn, formatPrice } from "@/lib/utils";
import { Check, Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Presupuesto",
  PAGO: "Pago",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const STATUS_ROW_CLASSES: Record<string, string> = {
  PENDIENTE: "bg-amber-50 dark:bg-amber-950/30",
  PAGO: "bg-green-50 dark:bg-green-950/30",
  ENVIADO: "bg-blue-50 dark:bg-blue-950/30",
  ENTREGADO: "bg-emerald-50 dark:bg-emerald-950/30",
  CANCELADO: "bg-red-50 dark:bg-red-950/30",
};

const STATUS_DOT: Record<string, string> = {
  PENDIENTE: "bg-amber-500",
  PAGO: "bg-green-500",
  ENTREGADO: "bg-emerald-500",
  CANCELADO: "bg-red-500",
};

const Invoices = () => {
  const navigate = useNavigate();
  const {
    searchInvoices,
    getRecentInvoices,
    getInvoicesWithStockNotDecreased,
  } = useInvoiceContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    Invoice["status"] | null
  >(null);
  const [showStockNotDecreased, setShowStockNotDecreased] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const hasQuery = searchQuery.trim().length > 0;
  const displayInvoices = useMemo(
    () => (hasQuery ? invoices : recentInvoices),
    [hasQuery, invoices, recentInvoices],
  );
  const displaySelected = useMemo(
    () =>
      selectedInvoice &&
      displayInvoices.some((i) => i.id === selectedInvoice.id)
        ? selectedInvoice
        : null,
    [displayInvoices, selectedInvoice],
  );

  useEffect(() => {
    let cancelled = false;
    if (showStockNotDecreased) {
      getInvoicesWithStockNotDecreased()
        .then((result) => {
          if (!cancelled) {
            setRecentInvoices(result);
            setSelectedInvoice(result[0] ?? null);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingRecent(false);
        });
    } else {
      getRecentInvoices(selectedStatus || undefined)
        .then((result) => {
          if (!cancelled) {
            setRecentInvoices(result);
            setSelectedInvoice(result[0] ?? null);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingRecent(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [
    getRecentInvoices,
    getInvoicesWithStockNotDecreased,
    selectedStatus,
    showStockNotDecreased,
  ]);

  useEffect(() => {
    if (!hasQuery) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => setIsSearching(true), 0);
    searchInvoices(searchQuery.trim(), selectedStatus || undefined)
      .then((result) => {
        if (!cancelled) {
          setInvoices(result);
          setSelectedInvoice(result[0] ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [hasQuery, searchQuery, searchInvoices, selectedStatus]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!hasQuery && recentInvoices.length > 0 && selectedInvoice !== null) {
      const inRecent = recentInvoices.some((i) => i.id === selectedInvoice.id);
      if (!inRecent) {
        const first = recentInvoices[0];
        queueMicrotask(() => setSelectedInvoice(first));
      }
    }
  }, [hasQuery, recentInvoices, selectedInvoice]);

  const selectedIndex = displaySelected
    ? displayInvoices.findIndex((i) => i.id === displaySelected.id)
    : -1;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (displayInvoices.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          selectedIndex < 0
            ? 0
            : Math.min(selectedIndex + 1, displayInvoices.length - 1);
        setSelectedInvoice(displayInvoices[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          selectedIndex < 0
            ? displayInvoices.length - 1
            : Math.max(selectedIndex - 1, 0);
        setSelectedInvoice(displayInvoices[prevIndex]);
      }
    },
    [displayInvoices, selectedIndex],
  );

  return (
    <div className="h-full flex flex-col md:flex-row gap-3 md:gap-5 p-3 md:p-5">
      <aside className="w-full md:w-64 shrink-0">
        <Card className="p-4 gap-4 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="size-4" />
              Filtros
            </h3>
            <label className="flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors hover:bg-accent/50">
              <Checkbox
                checked={showStockNotDecreased}
                onCheckedChange={(v) => setShowStockNotDecreased(v === true)}
              />
              <span>Sin retirar</span>
            </label>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <h4 className="px-2 mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estado
            </h4>
            <button
              type="button"
              onClick={() => setSelectedStatus(null)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors",
                selectedStatus === null
                  ? "bg-accent font-medium"
                  : "hover:bg-accent/50",
              )}
            >
              <span className="size-2.5 rounded-full bg-muted-foreground/40" />
              Todos
            </button>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                type="button"
                disabled={showStockNotDecreased}
                onClick={() => setSelectedStatus(status as Invoice["status"])}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors",
                  selectedStatus === status
                    ? "bg-accent font-medium"
                    : "hover:bg-accent/50",
                  showStockNotDecreased && "opacity-40 pointer-events-none",
                )}
              >
                <span
                  className={cn("size-2.5 rounded-full", STATUS_DOT[status])}
                />
                {label}
              </button>
            ))}
          </div>
        </Card>
      </aside>
      <div className="flex-1 min-w-0 min-h-0">
        <Card
          ref={tableRef}
          className="h-full flex flex-col overflow-hidden py-0 gap-0"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
            <div className="p-3 border-b shrink-0 flex items-center gap-2">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="search"
                placeholder="Buscar ventas por cliente, ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
                aria-label="Buscar ventas"
              />
              {isSearching && (
                <span className="text-sm text-muted-foreground">Buscando…</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))] py-4">
                    <TableHead className="w-1/12 bg-card">Número</TableHead>
                    <TableHead className="w-1/12 bg-card">Fecha</TableHead>
                    <TableHead className="w-3/12 bg-card">Cliente</TableHead>
                    <TableHead className="w-1/12 bg-card">Estado</TableHead>
                    <TableHead className="w-2/12 bg-card">Total</TableHead>
                    <TableHead className="w-2/12 bg-card">
                      Pago Restante
                    </TableHead>
                    <TableHead className="w-1/12 bg-card">Retirado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayInvoices.length === 0 &&
                    !isSearching &&
                    !isLoadingRecent && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          {hasQuery
                            ? "No se encontraron ventas"
                            : "No hay ventas recientes"}
                        </TableCell>
                      </TableRow>
                    )}
                  {displayInvoices.length === 0 &&
                    isLoadingRecent &&
                    !hasQuery && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          Cargando ventas recientes…
                        </TableCell>
                      </TableRow>
                    )}
                  {displayInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      data-state={
                        displaySelected?.id === invoice.id
                          ? "selected"
                          : undefined
                      }
                      onClick={() => navigate(`/invoice/${invoice.id}`)}
                      className={`cursor-pointer py-4`}
                    >
                      <TableCell># {invoice.invoiceNumber ?? "-"}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell
                        className={`${STATUS_ROW_CLASSES[invoice.status] ?? ""}`}
                      >
                        {STATUS_LABELS[invoice.status] ?? invoice.status}
                      </TableCell>
                      <TableCell className="font-medium">
                        $ {formatPrice(invoice.total)}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${" "}
                        {invoice.status === "PENDIENTE"
                          ? formatPrice(
                              invoice.total - (invoice.partialPayment ?? 0),
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium flex justify-center items-center">
                        {invoice.stockDecreased ? (
                          <Check color="green" />
                        ) : (
                          <X color="red" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
    </div>
  );
};

export default Invoices;
