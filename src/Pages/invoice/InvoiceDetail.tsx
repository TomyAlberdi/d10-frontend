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
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generatePDF } from "./CreateInvoiceDetail";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const SPANISH_MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatLocalDateToSpanish(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return dateStr;
  return `${d} de ${SPANISH_MONTHS[m - 1]} de ${y}`;
}

const InvoiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getInvoiceById } = useInvoiceContext();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    getInvoiceById(id)
      .then((result) => {
        if (!cancelled) {
          setInvoice(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [getInvoiceById, id]);

  const InvoiceDetail = useMemo(() => {
    return invoice ? generatePDF(invoice) : undefined;
  }, [invoice]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Volver
          </Button>
          <div className="flex gap-4">
            <Button
              disabled={!invoice}
              onClick={() => {
                if (InvoiceDetail) {
                  InvoiceDetail.save(
                    `Presupuesto_${invoice?.invoiceNumber ?? invoice?.id}.pdf`,
                  );
                }
              }}
            >
              <ReceiptText />
              Descargar Detalle
            </Button>
            {invoice && (
              <Button onClick={() => navigate(`/invoice/${invoice.id}/update`)}>
                Editar factura
              </Button>
            )}
          </div>
        </div>

        <Card className="p-6 flex flex-col gap-4">
          {isLoading && (
            <p className="text-muted-foreground">Cargando factura…</p>
          )}

          {!isLoading && !invoice && (
            <p className="text-muted-foreground">
              No se encontró la factura solicitada.
            </p>
          )}

          {!isLoading && invoice && (
            <>
              <h1 className="text-2xl font-bold">
                Detalle de factura #{invoice.invoiceNumber ?? invoice.id}
              </h1>

              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {formatLocalDateToSpanish(invoice?.date ?? "")}
                  </p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">
                    {STATUS_LABELS[invoice.status] ?? invoice.status}
                  </p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">
                    Stock descontado
                  </p>
                  <p className="font-medium">
                    {invoice.stockDecreased ? "Sí" : "No"}
                  </p>
                </div>
              </div>
              {invoice.notes && (
                <Card className="p-4 mt-4">
                  <h2 className="font-semibold mb-2">Notas</h2>
                  <p>{invoice.notes}</p>
                </Card>
              )}

              <Card className="p-4">
                <h2 className="font-semibold mb-2">Cliente</h2>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">ID:</span>{" "}
                    {invoice.client.id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Nombre:</span>{" "}
                    {invoice.client.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    {invoice.client.type}
                  </p>
                  <p>
                    <span className="text-muted-foreground">CUIT/DNI:</span>{" "}
                    {invoice.client.cuitDni}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Teléfono:</span>{" "}
                    {invoice.client.phone ?? "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {invoice.client.email ?? "—"}
                  </p>
                  <p className="col-span-3">
                    <span className="text-muted-foreground">Dirección:</span>{" "}
                    {invoice.client.address ?? "—"}
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="font-semibold mb-2">Productos</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo medida</TableHead>
                      <TableHead>Precio por medida</TableHead>
                      <TableHead>Cantidad medida</TableHead>
                      <TableHead>Tipo venta</TableHead>
                      <TableHead>Precio venta</TableHead>
                      <TableHead>Cantidad venta</TableHead>
                      <TableHead>Descuento</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell
                          className="cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </TableCell>
                        <TableCell>{product.measureType}</TableCell>
                        <TableCell>
                          $ {formatPrice(product.priceByMeasureUnit)}
                        </TableCell>
                        <TableCell>{product.measureUnitQuantity}</TableCell>
                        <TableCell>{product.saleUnitType}</TableCell>
                        <TableCell>
                          $ {formatPrice(product.priceBySaleUnit)}
                        </TableCell>
                        <TableCell>{product.saleUnitQuantity}</TableCell>
                        <TableCell>
                          $ {formatPrice(product.individualDiscount)}
                        </TableCell>
                        <TableCell className="font-medium">
                          $ {formatPrice(product.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <div className="grid grid-cols-4 gap-3">
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">
                    Total productos
                  </p>
                  <p className="font-medium">{invoice.products.length}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Descuento</p>
                  <p className="font-medium">
                    $ {formatPrice(invoice.discount)}
                  </p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Total factura</p>
                  <p className="text-lg font-bold">
                    $ {formatPrice(invoice.total)}
                  </p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Pago parcial</p>
                  <p className="font-medium">
                    $ {formatPrice(invoice.partialPayment ?? 0)}
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDetail;
