import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientContext } from "@/contexts/client/UseClientContext";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import type { Client } from "@/interfaces/ClientInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { balanceClassName, clientTypeLabel } from "@/lib/client";
import { cn, formatPrice } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  PencilLine,
  PiggyBank,
  Receipt,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Presupuesto",
  PAGO: "Pago",
  DEUDA: "Deuda",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/**
 * Only these statuses count as realized revenue (a "Presupuesto" is not a sale
 * and a "Deuda" is not collected yet).
 */
const REVENUE_STATUSES = new Set(["PAGO", "ENTREGADO"]);

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

const balanceCaption = (balance: number): string => {
  if (balance > 0) return "A favor del cliente";
  if (balance < 0) return "Deuda del cliente";
  return "Sin saldo";
};

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById } = useClientContext();
  const { getInvoicesByClient } = useInvoiceContext();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [invoicesError, setInvoicesError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getClientById(id)
      .then((result) => {
        if (!cancelled) setClient(result);
      })
      .catch(() => {
        // Error handled in context
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getClientById]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    getInvoicesByClient(client)
      .then((result) => {
        if (!cancelled) setInvoices(result);
      })
      .catch(() => {
        if (!cancelled) setInvoicesError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingInvoices(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, getInvoicesByClient]);

  const totalRevenue = useMemo(
    () =>
      invoices.reduce(
        (sum, i) => (REVENUE_STATUSES.has(i.status) ? sum + i.total : sum),
        0,
      ),
    [invoices],
  );
  // Invoices come sorted newest first.
  const lastPurchase = invoices.find((i) => i.status !== "CANCELADO")?.date;

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando cliente…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-lg text-destructive">Cliente no encontrado</div>
          <Button onClick={() => navigate("/client")}>
            <ChevronLeft className="bigger-icon" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-5 flex flex-col md:flex-row gap-4 pt-4 md:pt-0">
      {/* Client info (left on desktop, top on mobile) */}
      <aside className="w-full md:w-1/3 min-w-0">
        <Card className="h-auto md:h-[calc(100dvh-6.5rem)] overflow-y-auto flex flex-col gap-4 p-4">
          <div className="flex shrink-0 flex-col gap-2">
            <h1 className="text-2xl font-bold leading-tight break-words">
              {client.name}
            </h1>
            <Badge className="w-fit">{clientTypeLabel(client.type)}</Badge>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 flex items-center gap-3 shrink-0">
            <PiggyBank className="size-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {balanceCaption(client.balance)}
              </p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  balanceClassName(client.balance),
                )}
              >
                $ {formatPrice(client.balance)}
              </p>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-1 gap-2">
            <div className="flex flex-col rounded-md border px-3 py-2">
              <span className="text-sm text-muted-foreground">
                {client.type === "CONSUMIDOR_FINAL" ? "DNI" : "CUIT"}
              </span>
              <span className="font-medium text-base break-words">
                {client.cuitDni || "—"}
              </span>
            </div>
            <div className="flex flex-col rounded-md border px-3 py-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium text-base break-words">
                {client.email || "—"}
              </span>
            </div>
            <div className="flex flex-col rounded-md border px-3 py-2">
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <span className="font-medium text-base break-words">
                {client.phone || "—"}
              </span>
            </div>
            <div className="flex flex-col rounded-md border px-3 py-2">
              <span className="text-sm text-muted-foreground">Dirección</span>
              <span className="font-medium text-base break-words">
                {client.address || "—"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid shrink-0 grid-cols-2 gap-2">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Ventas</p>
              <p className="text-2xl font-bold">
                {isLoadingInvoices ? "…" : invoices.length}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Última compra</p>
              <p className="text-lg font-bold">
                {isLoadingInvoices ? "…" : (lastPurchase ?? "—")}
              </p>
            </div>
            <div className="col-span-2 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Total facturado</p>
              <p className="text-2xl font-bold">
                {isLoadingInvoices ? "…" : `$ ${formatPrice(totalRevenue)}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex shrink-0 flex-col gap-2 pt-2">
            <Button
              size="lg"
              onClick={() => navigate(`/client/${client.id}/balance`)}
            >
              <PiggyBank />
              Ajustar saldo
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/client/${client.id}/update`)}
            >
              <PencilLine />
              Editar
            </Button>
            <Button variant="ghost" onClick={() => navigate("/client")}>
              <ChevronLeft />
              Volver a clientes
            </Button>
          </div>
        </Card>
      </aside>

      {/* Invoices (right) */}
      <div className="w-full md:w-2/3 min-w-0">
        <Card className="h-[calc(100dvh-6.5rem)] flex flex-col overflow-hidden py-0 gap-0">
          <div className="p-3 border-b shrink-0 flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground shrink-0" />
            <h2 className="text-lg font-semibold">Ventas del cliente</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableHead className="w-2/12 bg-card">Número</TableHead>
                  <TableHead className="w-2/12 bg-card">Fecha</TableHead>
                  <TableHead className="w-2/12 bg-card">Estado</TableHead>
                  <TableHead className="w-2/12 bg-card">Total</TableHead>
                  <TableHead className="w-2/12 bg-card">
                    Pago Restante
                  </TableHead>
                  <TableHead className="w-1/12 bg-card">Retirado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isLoadingInvoices ||
                  invoicesError ||
                  invoices.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className={cn(
                        "text-center py-8",
                        invoicesError
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {isLoadingInvoices
                        ? "Cargando ventas…"
                        : invoicesError
                          ? "Error al cargar las ventas"
                          : "Este cliente no tiene ventas"}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingInvoices &&
                  invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      onClick={() => navigate(`/invoice/${invoice.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell># {invoice.invoiceNumber ?? "-"}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell
                        className={STATUS_ROW_CLASSES[invoice.status] ?? ""}
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
                      <TableCell className="font-medium">
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

export default ClientDetail;
