import { Input } from "@/components/ui/input";
import { useClientContext } from "@/contexts/client/UseClientContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

interface CartClientSearchProps {
  onSelect: (client: Client) => void;
}

/**
 * Search box that looks clients up by name or CUIT/DNI and lets the user
 * pick one for the cart.
 */
const CartClientSearch = ({ onSelect }: CartClientSearchProps) => {
  const { searchClients } = useClientContext();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const hasQuery = searchQuery.trim().length > 0;

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!hasQuery) return;
    let cancelled = false;
    const timeoutId = setTimeout(() => setIsSearching(true), 0);
    searchClients(searchQuery.trim())
      .then((result) => {
        if (!cancelled) {
          setResults(result);
          setHighlighted(0);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [hasQuery, searchQuery, searchClients]);

  const displayResults = hasQuery ? results : [];

  const handleSelect = (client: Client) => {
    onSelect(client);
    setSearchInput("");
    setSearchQuery("");
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (displayResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, displayResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const client = displayResults[highlighted];
      if (client) handleSelect(client);
    }
  };

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex items-center gap-2">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <Input
          type="search"
          placeholder="Buscar cliente por nombre o CUIT/DNI"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Buscar cliente"
        />
      </div>
      {hasQuery && (
        <div className="max-h-60 overflow-y-auto rounded-md border">
          {isSearching && displayResults.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Buscando…
            </p>
          ) : displayResults.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No se encontraron clientes
            </p>
          ) : (
            <ul role="listbox">
              {displayResults.map((client, index) => (
                <li
                  key={client.id}
                  role="option"
                  aria-selected={index === highlighted}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => handleSelect(client)}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    index === highlighted ? "bg-muted" : ""
                  }`}
                >
                  <p className="font-medium">{client.name}</p>
                  <p className="text-muted-foreground">{client.cuitDni}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CartClientSearch;
