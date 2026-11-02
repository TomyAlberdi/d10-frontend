import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import { useSessionState } from "@/hooks/use-session-state";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { invoiceClientName } from "@/lib/invoice";
import { formatPrice } from "@/lib/utils";
import { Check, Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  InvoiceFiltersDrawer,
  InvoiceFiltersPanel,
  type InvoiceFilterValues,
} from "./InvoiceFilters";

const SEARCH_DEBOUNCE_MS = 300;

/** sessionStorage key prefix for the search/filters, kept across page changes. */
const STORAGE_PREFIX = "invoices-search";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Presupuesto",
  PAGO: "Pago",
  DEUDA: "Deuda",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Statuses that still owe money, so the pending balance is worth showing. */
const UNPAID_STATUSES = new Set(["PENDIENTE", "DEUDA"]);

const STATUS_ROW_CLASSES: Record<string, string> = {
  PENDIENTE: "bg-amber-50 dark:bg-amber-950/30",
  PAGO: "bg-green-50 dark:bg-green-950/30",
  DEUDA: "bg-orange-50 dark:bg-orange-950/30",
  ENVIADO: "bg-blue-50 dark:bg-blue-950/30",
  ENTREGADO: "bg-emerald-50 dark:bg-emerald-950/30",
  CANCELADO: "bg-red-50 dark:bg-red-950/30",
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
  const [searchInput, setSearchInput] = useSessionState(
    `${STORAGE_PREFIX}:query`,
    "",
  );
  // Start from the restored input so a persisted search runs immediately
  // instead of waiting for the debounce.
  const [searchQuery, setSearchQuery] = useState(searchInput);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [selectedStatus, setSelectedStatus] = useSessionState<
    Invoice["status"] | null
  >(`${STORAGE_PREFIX}:status`, null);
  const [showStockNotDecreased, setShowStockNotDecreased] = useSessionState(
    `${STORAGE_PREFIX}:stockNotDecreased`,
    false,
  );
  const [dateFrom, setDateFrom] = useSessionState(
    `${STORAGE_PREFIX}:dateFrom`,
    "",
  );
  const [dateTo, setDateTo] = useSessionState(`${STORAGE_PREFIX}:dateTo`, "");
  const tableRef = useRef<HTMLDivElement>(null);

  const filters: InvoiceFilterValues = {
    status: selectedStatus,
    stockNotDecreased: showStockNotDecreased,
    dateFrom,
    dateTo,
  };
  const applyFilters = (patch: Partial<InvoiceFilterValues>) => {
    if (patch.status !== undefined) setSelectedStatus(patch.status);
    if (patch.stockNotDecreased !== undefined) {
      setShowStockNotDecreased(patch.stockNotDecreased);
    }
    if (patch.dateFrom !== undefined) setDateFrom(patch.dateFrom);
    if (patch.dateTo !== undefined) setDateTo(patch.dateTo);
  };

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
      getRecentInvoices(
        selectedStatus || undefined,
        dateFrom || undefined,
        dateTo || undefined,
      )
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
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    if (!hasQuery) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => setIsSearching(true), 0);
    searchInvoices(
      searchQuery.trim(),
      selectedStatus || undefined,
      dateFrom || undefined,
      dateTo || undefined,
    )
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
  }, [
    hasQuery,
    searchQuery,
    searchInvoices,
    selectedStatus,
    dateFrom,
    dateTo,
  ]);

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
    <div className="flex flex-col gap-3 p-3 md:h-full md:flex-row md:gap-5 md:p-5">
      <aside className="hidden md:block w-64 shrink-0">
        <Card className="p-4 gap-4 overflow-y-auto">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="size-4" />
            Filtros
          </h3>
          <InvoiceFiltersPanel
            value={filters}
            onChange={applyFilters}
            idPrefix="invoice-filters"
          />
        </Card>
      </aside>
      <div className="flex-1 min-w-0 min-h-0">
        <Card
          ref={tableRef}
          className="flex flex-col overflow-hidden py-0 gap-0 md:h-full"
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
              <InvoiceFiltersDrawer
                filters={filters}
                onApply={applyFilters}
                className="md:hidden"
              />
            </div>
            <div className="md:flex-1 md:overflow-y-auto">
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
                      <TableCell>{invoiceClientName(invoice.client)}</TableCell>
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
                        {UNPAID_STATUSES.has(invoice.status)
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
