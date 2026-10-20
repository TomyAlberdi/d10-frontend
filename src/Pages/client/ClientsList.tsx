import { Button } from "@/components/ui/button";
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
import { useClientContext } from "@/contexts/client/UseClientContext";
import { useSessionState } from "@/hooks/use-session-state";
import type { Client } from "@/interfaces/ClientInterfaces";
import {
  BALANCE_FILTER_LABELS,
  balanceClassName,
  clientTypeLabel,
  matchesBalanceFilter,
  type BalanceFilter,
} from "@/lib/client";
import { cn, formatPrice } from "@/lib/utils";
import { CirclePlus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectedClient from "./SelectedClient";

const SEARCH_DEBOUNCE_MS = 300;

/** sessionStorage key prefix for the search/filter, kept across page changes. */
const STORAGE_PREFIX = "clients-search";

const BALANCE_FILTER_DOT: Record<BalanceFilter, string> = {
  ALL: "bg-muted-foreground/40",
  POSITIVE: "bg-emerald-500",
  NEGATIVE: "bg-destructive",
};

/**
 * Filtered by balance, the clients furthest from zero come first: the biggest
 * debts or the biggest credits.
 */
const sortByBalance = (clients: Client[], filter: BalanceFilter): Client[] => {
  if (filter === "POSITIVE") return [...clients].sort((a, b) => b.balance - a.balance);
  if (filter === "NEGATIVE") return [...clients].sort((a, b) => a.balance - b.balance);
  return clients;
};

const ClientsList = () => {
  const navigate = useNavigate();
  const { searchClients } = useClientContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchInput, setSearchInput] = useSessionState(
    `${STORAGE_PREFIX}:query`,
    "",
  );
  // Start from the restored input so a persisted search runs immediately
  // instead of waiting for the debounce.
  const [searchQuery, setSearchQuery] = useState(searchInput);
  const [balanceFilter, setBalanceFilter] = useSessionState<BalanceFilter>(
    `${STORAGE_PREFIX}:balance`,
    "ALL",
  );
  // Only the id is kept, so coming back from a client's pages selects the
  // same client again once the results reload.
  const [selectedClientId, setSelectedClientId] = useSessionState<
    string | null
  >(`${STORAGE_PREFIX}:selected`, null);
  const [isSearching, setIsSearching] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = searchQuery.trim();
  const hasQuery = trimmedQuery.length > 0;
  // A balance filter lists every matching client, even without a query.
  const isActive = hasQuery || balanceFilter !== "ALL";
  const displayClients = useMemo(
    () => (isActive ? clients : []),
    [isActive, clients],
  );
  const displaySelected = useMemo(
    () =>
      displayClients.find((c) => c.id === selectedClientId) ??
      displayClients[0] ??
      null,
    [displayClients, selectedClientId],
  );

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => setIsSearching(true), 0);
    // An empty query matches every client, which the balance filter narrows.
    searchClients(trimmedQuery)
      .then((result) => {
        if (!cancelled) {
          setClients(
            sortByBalance(
              result.filter((c) => matchesBalanceFilter(c, balanceFilter)),
              balanceFilter,
            ),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isActive, trimmedQuery, balanceFilter, searchClients]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const selectedIndex = displaySelected
    ? displayClients.findIndex((c) => c.id === displaySelected.id)
    : -1;

  const openDetails = useCallback(
    (client: Client) => {
      setSelectedClientId(client.id);
      navigate(`/client/${client.id}`);
    },
    [navigate, setSelectedClientId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (displayClients.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          selectedIndex < 0
            ? 0
            : Math.min(selectedIndex + 1, displayClients.length - 1);
        setSelectedClientId(displayClients[nextIndex].id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          selectedIndex < 0
            ? displayClients.length - 1
            : Math.max(selectedIndex - 1, 0);
        setSelectedClientId(displayClients[prevIndex].id);
      } else if (e.key === "Enter" && displaySelected) {
        e.preventDefault();
        openDetails(displaySelected);
      }
    },
    [
      displayClients,
      selectedIndex,
      displaySelected,
      setSelectedClientId,
      openDetails,
    ],
  );

  return (
    <div className="px-2 md:px-5 h-full flex flex-col md:flex-row gap-4 pt-4 md:pt-0">
      {/* Detail (left on desktop, top on mobile) */}
      <div className="w-full md:w-1/3 min-w-0">
        <SelectedClient client={displaySelected} />
      </div>
      {/* List (right) */}
      <div className="w-full md:w-2/3 min-w-0">
        <Card
          ref={tableRef}
          className="h-[calc(100dvh-6.5rem)] flex flex-col overflow-hidden py-0 gap-0"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="p-3 border-b shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="search"
                placeholder="Buscar por nombre o CUIT/DNI"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
                aria-label="Buscar clientes"
              />
              {isSearching && (
                <span className="text-sm text-muted-foreground">Buscando…</span>
              )}
              <Button
                className="h-full"
                size="sm"
                onClick={() => navigate("/client/create")}
              >
                <CirclePlus className="size-4" />
                <span className="ml-2">Crear Cliente</span>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Saldo
              </span>
              {(Object.keys(BALANCE_FILTER_LABELS) as BalanceFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={balanceFilter === filter}
                    onClick={() => setBalanceFilter(filter)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                      balanceFilter === filter
                        ? "bg-accent font-medium"
                        : "hover:bg-accent/50",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        BALANCE_FILTER_DOT[filter],
                      )}
                    />
                    {BALANCE_FILTER_LABELS[filter]}
                  </button>
                ),
              )}
              {isActive && !isSearching && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {displayClients.length}{" "}
                  {displayClients.length === 1 ? "cliente" : "clientes"}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableHead className="w-2/12 bg-card">Tipo</TableHead>
                  <TableHead className="w-3/12 bg-card">Nombre</TableHead>
                  <TableHead className="w-2/12 bg-card">CUIT / DNI</TableHead>
                  <TableHead className="w-2/12 bg-card">Email</TableHead>
                  <TableHead className="w-1/12 bg-card">Teléfono</TableHead>
                  <TableHead className="w-2/12 bg-card text-right">
                    Saldo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayClients.length === 0 && !isSearching && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      {isActive
                        ? "No se encontraron clientes"
                        : "Escriba en la búsqueda o elija un filtro de saldo para listar clientes"}
                    </TableCell>
                  </TableRow>
                )}
                {displayClients.map((client) => (
                  <TableRow
                    key={client.id}
                    data-state={
                      displaySelected?.id === client.id ? "selected" : undefined
                    }
                    onClick={() => setSelectedClientId(client.id)}
                    onDoubleClick={() => openDetails(client)}
                    className="cursor-pointer"
                  >
                    <TableCell>{clientTypeLabel(client.type)}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.cuitDni}</TableCell>
                    <TableCell>{client.email || "—"}</TableCell>
                    <TableCell>{client.phone || "—"}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        balanceClassName(client.balance),
                      )}
                    >
                      $ {formatPrice(client.balance)}
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

export default ClientsList;
