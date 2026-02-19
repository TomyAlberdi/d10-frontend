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
import { formatPrice } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGO_PARCIAL: "Pago parcial",
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
  const { getInvoiceById, registerInvoicePayment } = useInvoiceContext();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isRegisteringPayment, setIsRegisteringPayment] = useState(false);

  useEffect(() => {
    if (!id) {
      setInvoice(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

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

  const dateFormatted = useMemo(() => {
    if (!invoice?.date) return "—";
    return formatLocalDateToSpanish(invoice.date);
  }, [invoice?.date]);

  const paidAmount = useMemo(
    () =>
      invoice?.paidAmount ??
      invoice?.payments?.reduce((sum, payment) => sum + payment.amount, 0) ??
      0,
    [invoice?.paidAmount, invoice?.payments],
  );

  const remainingAmount = useMemo(
    () => (invoice ? invoice.remainingAmount ?? Math.max(0, invoice.total - paidAmount) : 0),
    [invoice, paidAmount],
  );

  const handleRegisterPartialPayment = async () => {
    if (!invoice || !Number.isFinite(paymentAmount) || paymentAmount <= 0) return;
    setIsRegisteringPayment(true);
    try {
      await registerInvoicePayment(invoice.id, paymentAmount);
      const updatedInvoice = await getInvoiceById(invoice.id);
      setInvoice(updatedInvoice);
      setPaymentAmount(0);
    } finally {
      setIsRegisteringPayment(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Volver
          </Button>
          {invoice && (
            <Button onClick={() => navigate(`/invoice/${invoice.id}/update`)}>
              Editar factura
            </Button>
          )}
        </div>

        <Card className="p-6 flex flex-col gap-4">
          {isLoading && <p className="text-muted-foreground">Cargando factura…</p>}

          {!isLoading && !invoice && (
            <p className="text-muted-foreground">No se encontró la factura solicitada.</p>
          )}

          {!isLoading && invoice && (
            <>
              <h1 className="text-2xl font-bold">Detalle de factura #{invoice.id}</h1>

              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{dateFormatted}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{STATUS_LABELS[invoice.status] ?? invoice.status}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Stock descontado</p>
                  <p className="font-medium">{invoice.stockDecreased ? "Sí" : "No"}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Monto pagado</p>
                  <p className="font-medium">$ {formatPrice(paidAmount)}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Saldo pendiente</p>
                  <p className="font-medium">$ {formatPrice(remainingAmount)}</p>
                </div>
              </div>

              <Card className="p-4">
                <h2 className="font-semibold mb-2">Registrar pago parcial</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="border rounded-md px-3 py-2 w-48"
                    placeholder="Monto"
                  />
                  <Button
                    onClick={handleRegisterPartialPayment}
                    disabled={isRegisteringPayment || paymentAmount <= 0 || paymentAmount > remainingAmount}
                  >
                    {isRegisteringPayment ? "Registrando…" : "Registrar pago"}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="font-semibold mb-2">Cliente</h2>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <p><span className="text-muted-foreground">ID:</span> {invoice.client.id}</p>
                  <p><span className="text-muted-foreground">Nombre:</span> {invoice.client.name}</p>
                  <p><span className="text-muted-foreground">Tipo:</span> {invoice.client.type}</p>
                  <p><span className="text-muted-foreground">CUIT/DNI:</span> {invoice.client.cuitDni}</p>
                  <p><span className="text-muted-foreground">Teléfono:</span> {invoice.client.phone ?? "—"}</p>
                  <p><span className="text-muted-foreground">Email:</span> {invoice.client.email ?? "—"}</p>
                  <p className="col-span-3"><span className="text-muted-foreground">Dirección:</span> {invoice.client.address ?? "—"}</p>
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
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.measureType}</TableCell>
                        <TableCell>$ {formatPrice(product.priceByMeasureUnit)}</TableCell>
                        <TableCell>{product.measureUnitQuantity}</TableCell>
                        <TableCell>{product.saleUnitType}</TableCell>
                        <TableCell>$ {formatPrice(product.priceBySaleUnit)}</TableCell>
                        <TableCell>{product.saleUnitQuantity}</TableCell>
                        <TableCell>$ {formatPrice(product.individualDiscount)}</TableCell>
                        <TableCell className="font-medium">$ {formatPrice(product.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {invoice.payments && invoice.payments.length > 0 && (
                <Card className="p-4">
                  <h2 className="font-semibold mb-2">Pagos registrados</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.payments.map((payment, index) => (
                        <TableRow key={payment.id ?? `${index}-${payment.amount}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>$ {formatPrice(payment.amount)}</TableCell>
                          <TableCell>{payment.date ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Total productos</p>
                  <p className="font-medium">{invoice.products.length}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Descuento</p>
                  <p className="font-medium">$ {formatPrice(invoice.discount)}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Total factura</p>
                  <p className="text-lg font-bold">$ {formatPrice(invoice.total)}</p>
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
