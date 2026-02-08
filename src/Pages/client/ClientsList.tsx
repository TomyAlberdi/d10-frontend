import { useClientContext } from "@/contexts/client/UseClientContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import SelectedClient from "./SelectedClient";

const SEARCH_DEBOUNCE_MS = 300;

const ClientsList = () => {
  const { searchClients } = useClientContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const hasQuery = searchQuery.trim().length > 0;
  const displayClients = useMemo(
    () => (hasQuery ? clients : []),
    [hasQuery, clients]
  );
  const displaySelected = useMemo(
    () =>
      hasQuery &&
      selectedClient &&
      clients.some((c) => c.id === selectedClient.id)
        ? selectedClient
        : null,
    [hasQuery, clients, selectedClient]
  );

  useEffect(() => {
    if (!hasQuery) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => setIsSearching(true), 0);
    searchClients(searchQuery.trim())
      .then((result) => {
        if (!cancelled) {
          setClients(result);
          setSelectedClient(result[0] ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [hasQuery, searchQuery, searchClients]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const selectedIndex = displaySelected
    ? displayClients.findIndex((c) => c.id === displaySelected.id)
    : -1;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (displayClients.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          selectedIndex < 0
            ? 0
            : Math.min(selectedIndex + 1, displayClients.length - 1);
        setSelectedClient(displayClients[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          selectedIndex < 0
            ? displayClients.length - 1
            : Math.max(selectedIndex - 1, 0);
        setSelectedClient(displayClients[prevIndex]);
      }
    },
    [displayClients, selectedIndex]
  );

  return (
    <div className="px-5 h-full flex flex-col gap-4">
      <SelectedClient client={displaySelected} />
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
            placeholder="Buscar por nombre o CUIT/DNI"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
            aria-label="Buscar clientes"
          />
          {isSearching && (
            <span className="text-sm text-muted-foreground">Buscando…</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <TableHead className="w-2/12 bg-card">Tipo</TableHead>
                <TableHead className="w-4/12 bg-card">Nombre</TableHead>
                <TableHead className="w-2/12 bg-card">CUIT / DNI</TableHead>
                <TableHead className="w-2/12 bg-card">Email</TableHead>
                <TableHead className="w-2/12 bg-card">Teléfono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayClients.length === 0 && !isSearching && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    {hasQuery
                      ? "No se encontraron clientes"
                      : "Escriba en la búsqueda para listar clientes"}
                  </TableCell>
                </TableRow>
              )}
              {displayClients.map((client) => (
                <TableRow
                  key={client.id}
                  data-state={
                    displaySelected?.id === client.id ? "selected" : undefined
                  }
                  onClick={() => setSelectedClient(client)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    {client.type === "FISICA"
                      ? "Persona física"
                      : "Persona jurídica"}
                  </TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.cuitDni}</TableCell>
                  <TableCell>{client.email ?? "—"}</TableCell>
                  <TableCell>{client.phone ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ClientsList;
