import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { formatPrice } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SelectedInvoice from "./SelectedInvoice";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGO: "Pago",
  ENVIADO: "Enviado",
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

const Invoices = () => {
  const { searchInvoices, getRecentInvoices } = useInvoiceContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const hasQuery = searchQuery.trim().length > 0;
  const displayInvoices = useMemo(
    () => (hasQuery ? invoices : recentInvoices),
    [hasQuery, invoices, recentInvoices]
  );
  const displaySelected = useMemo(
    () =>
      selectedInvoice &&
      displayInvoices.some((i) => i.id === selectedInvoice.id)
        ? selectedInvoice
        : null,
    [displayInvoices, selectedInvoice]
  );

  useEffect(() => {
    let cancelled = false;
    getRecentInvoices()
      .then((result) => {
        if (!cancelled) {
          setRecentInvoices(result);
          setSelectedInvoice(result[0] ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRecent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getRecentInvoices]);

  useEffect(() => {
    if (!hasQuery) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => setIsSearching(true), 0);
    searchInvoices(searchQuery.trim())
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
  }, [hasQuery, searchQuery, searchInvoices]);

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
    [displayInvoices, selectedIndex]
  );

  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        {/* Single view, no routing buttons needed */}
      </section>
      <section className="w-5/8 h-screen py-5">
        <div className="px-5 h-full flex flex-col gap-4">
          <SelectedInvoice invoice={displaySelected} />
          <Card
            ref={tableRef}
            className="h-4/6 flex flex-col overflow-hidden py-0 gap-0"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div className="p-3 border-b shrink-0 flex items-center gap-2">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="search"
                placeholder="Buscar facturas por cliente, ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
                aria-label="Buscar facturas"
              />
              {isSearching && (
                <span className="text-sm text-muted-foreground">
                  Buscando…
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                    <TableHead className="w-4/12 bg-card">Cliente</TableHead>
                    <TableHead className="w-2/12 bg-card">Estado</TableHead>
                    <TableHead className="w-2/12 bg-card">Productos</TableHead>
                    <TableHead className="w-2/12 bg-card">Descuento</TableHead>
                    <TableHead className="w-3/12 bg-card">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayInvoices.length === 0 && !isSearching && !isLoadingRecent && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        {hasQuery
                          ? "No se encontraron facturas"
                          : "No hay facturas recientes"}
                      </TableCell>
                    </TableRow>
                  )}
                  {displayInvoices.length === 0 && isLoadingRecent && !hasQuery && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Cargando facturas recientes…
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
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`cursor-pointer ${STATUS_ROW_CLASSES[invoice.status] ?? ""}`}
                    >
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>
                        {STATUS_LABELS[invoice.status] ?? invoice.status}
                      </TableCell>
                      <TableCell>{invoice.products.length}</TableCell>
                      <TableCell>
                        $ {formatPrice(invoice.discount)}
                      </TableCell>
                      <TableCell className="font-medium">
                        $ {formatPrice(invoice.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Invoices;
