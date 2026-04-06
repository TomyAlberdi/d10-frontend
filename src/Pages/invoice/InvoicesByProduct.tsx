import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Check, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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

const InvoicesByProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { getInvoicesByProductId } = useInvoiceContext();
  const { getProductById } = useProductContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const displayInvoices = useMemo(() => invoices, [invoices]);
  const displaySelected = useMemo(
    () =>
      selectedInvoice &&
      displayInvoices.some((i) => i.id === selectedInvoice.id)
        ? selectedInvoice
        : null,
    [displayInvoices, selectedInvoice],
  );

  useEffect(() => {
    if (!productId) {
      setError("ID de producto no proporcionado");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // Load product details
    getProductById(productId)
      .then((product) => {
        if (!cancelled && product) {
          setProductName(product.name);
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      });

    // Load invoices containing this product
    getInvoicesByProductId(productId)
      .then((result) => {
        if (!cancelled) {
          setInvoices(result);
          setSelectedInvoice(result[0] ?? null);
        }
      })
      .catch((err) => {
        console.error("Error fetching invoices:", err);
        setError("Error al cargar las ventas");
        toast.error("Error al cargar las ventas");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, getInvoicesByProductId, getProductById]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando ventas por producto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-lg text-destructive">{error}</div>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gap-5">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Información</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Producto
              </label>
              <p className="text-sm font-semibold">{productName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Total de Ventas
              </label>
              <p className="text-lg font-bold">{displayInvoices.length}</p>
            </div>
          </div>
        </Card>
      </section>
      <section className="w-5/8 h-screen py-5">
        <div className="px-5 h-full flex flex-col gap-4">
          <Card
            ref={tableRef}
            className="h-full flex flex-col overflow-hidden py-0 gap-0"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div className="p-3 border-b shrink-0">
              <h2 className="text-lg font-semibold">
                Ventas que contienen el producto "{productName}"
              </h2>
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
                  {displayInvoices.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No hay ventas que contengan este producto
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
                      className="cursor-pointer py-4"
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
      </section>
    </div>
  );
};

export default InvoicesByProduct;
