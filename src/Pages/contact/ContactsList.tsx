/* eslint-disable react-hooks/set-state-in-effect */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContactContext } from "@/contexts/contact/UseContactContext";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
  type Contact,
  type ContactType,
} from "@/interfaces/ContactInterfaces";
import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const ALL_TYPES = "ALL";

const ContactsList = () => {
  const navigate = useNavigate();
  const { listContacts, deleteContactById } = useContactContext();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | typeof ALL_TYPES>(
    ALL_TYPES,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const query = searchQuery.trim() || null;
    const type = typeFilter === ALL_TYPES ? null : typeFilter;
    listContacts(query, type, page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setContacts(result.content);
          setTotalPages(result.totalPages);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContacts([]);
          setTotalPages(0);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listContacts, page, searchQuery, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este contacto?"))
      return;
    try {
      await deleteContactById(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contacto eliminado");
    } catch (error) {
      console.error(error);
    }
  };

  const emptyMessage = isLoading
    ? "Cargando…"
    : "No se encontraron contactos";

  return (
    <div className="px-2 md:px-5 h-full">
      <Card className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col overflow-hidden py-0 gap-0">
        {/* Toolbar: search + type filter + create */}
        <div className="p-3 border-b shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Input
              type="search"
              placeholder="Buscar por nombre"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
              aria-label="Buscar contactos"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(v) =>
                setTypeFilter(v as ContactType | typeof ALL_TYPES)
              }
            >
              <SelectTrigger
                className="flex-1 sm:w-44"
                aria-label="Filtrar por tipo"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES}>Todos los tipos</SelectItem>
                {CONTACT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CONTACT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => navigate("/contact/create")}
              className="shrink-0"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableHead className="w-3/12 bg-card">Nombre</TableHead>
                  <TableHead className="w-2/12 bg-card">Tipo</TableHead>
                  <TableHead className="w-3/12 bg-card">Email</TableHead>
                  <TableHead className="w-2/12 bg-card">Teléfono</TableHead>
                  <TableHead className="w-2/12 bg-card text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
                {contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => navigate(`/contact/${contact.id}/update`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {contact.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CONTACT_TYPE_LABELS[contact.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="break-all">
                      {contact.email || "—"}
                    </TableCell>
                    <TableCell>{contact.phone || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar contacto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contact.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 p-2 md:hidden">
            {contacts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </p>
            )}
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                onClick={() => navigate(`/contact/${contact.id}/update`)}
                className="p-3 gap-2 cursor-pointer transition-colors hover:border-primary active:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-base break-words">
                      {contact.name}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {CONTACT_TYPE_LABELS[contact.type]}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar contacto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contact.id);
                    }}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">Email</span>
                    <span className="break-all">{contact.email || "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">Tel.</span>
                    <span>{contact.phone || "—"}</span>
                  </div>
                  {contact.detail && (
                    <p className="text-muted-foreground line-clamp-2">
                      {contact.detail}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <Pagination className="mt-auto shrink-0 border-t py-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 0) setPage(page - 1);
                }}
                aria-disabled={page <= 0}
                className={
                  page <= 0
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                text=""
              />
            </PaginationItem>
            <PaginationItem>
              <span>
                {page + 1} de {totalPages || 1}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages - 1) setPage(page + 1);
                }}
                aria-disabled={page >= totalPages - 1}
                className={
                  page >= totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                text=""
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Card>
    </div>
  );
};

export default ContactsList;
