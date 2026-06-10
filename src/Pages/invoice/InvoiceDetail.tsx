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
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { formatPrice } from "@/lib/utils";
import { ArrowRightLeft, ChevronLeft, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { generatePDF } from "./CreateInvoiceDetail";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Presupuesto",
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
  const { getInvoiceById, deleteInvoiceById } = useInvoiceContext();
  const {
    clearCart,
    setCartClient,
    addProduct,
    setDiscount,
    setCartNotes,
    setPaymentMethod,
    setStockDecreased,
  } = useCartContext();
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

  const handleSendToCart = () => {
    if (!invoice) return;

    toast.warning(
      "¿Enviar venta al carrito? Se perderá el carrito actual y se eliminará la venta.",
      {
        action: {
          label: "Confirmar",
          onClick: async () => {
            try {
              // Clear current cart
              clearCart();

              // Fill cart with invoice data
              setCartClient(invoice.client);
              invoice.products.forEach((product) => {
                addProduct(product);
              });
              setDiscount(invoice.discount);
              if (invoice.notes) {
                setCartNotes(invoice.notes);
              }
              if (invoice.paymentMethod) {
                setPaymentMethod(invoice.paymentMethod);
              }
              if (invoice.stockDecreased !== undefined) {
                setStockDecreased(invoice.stockDecreased);
              }

              // Delete the invoice
              await deleteInvoiceById(invoice.id);

              // Navigate to cart
              navigate("/cart");
              toast.success("Venta enviada al carrito");
            } catch (error) {
              toast.error("Error al enviar la venta al carrito");
              console.error(error);
            }
          },
        },
      },
    );
  };

  const InvoiceDetail = useMemo(() => {
    return invoice ? generatePDF(invoice) : undefined;
  }, [invoice]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
          <Button onClick={() => navigate(-1)} className="w-full md:w-fit">
            <ChevronLeft className="bigger-icon" />
          </Button>
          {invoice && (
            <div className="flex gap-4 w-full md:w-auto flex-wrap">
              <Button
                className="w-full md:w-fit"
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
              {invoice.status === "PENDIENTE" && (
                <Button
                  onClick={handleSendToCart}
                  variant="secondary"
                  className="w-full md:w-fit"
                >
                  <ArrowRightLeft />
                  Enviar al carrito
                </Button>
              )}
              <Button
                onClick={() => navigate(`/invoice/${invoice.id}/update`)}
                className="w-full md:w-fit"
              >
                Editar venta
              </Button>
            </div>
          )}
        </div>

        <Card className="p-3 md:p-6 flex flex-col gap-4">
          {isLoading && (
            <p className="text-muted-foreground">Cargando venta…</p>
          )}
          {!isLoading && !invoice && (
            <p className="text-muted-foreground">
              No se encontró la venta solicitada.
            </p>
          )}
          {!isLoading && invoice && (
            <>
              <h1 className="text-2xl font-bold">
                Detalle de venta #{invoice.invoiceNumber ?? invoice.id}
              </h1>

              <div className="flex flex-col md:grid grid-cols-3 gap-3">
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
                <Card className="p-4 gap-3">
                  <h2 className="font-semibold">Notas</h2>
                  <p>{invoice.notes}</p>
                </Card>
              )}

              <Card className="p-4 gap-3">
                <h2 className="font-semibold">Cliente</h2>
                <div className="flex flex-col md:grid grid-cols-3 gap-3 text-sm">
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

              <Card className="p-4 gap-3">
                <h2 className="font-semibold">Productos</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo medida</TableHead>
                      <TableHead>Precio por medida</TableHead>
                      <TableHead>Cantidad medida</TableHead>
                      <TableHead>Precio unidad</TableHead>
                      <TableHead>Cantidad unidad</TableHead>
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
                        <TableCell>
                          {formatPrice(product.measureUnitQuantity)}
                        </TableCell>
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

              <div className="flex flex-col md:grid grid-cols-4 gap-3">
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
                  <p className="text-sm text-muted-foreground">Total venta</p>
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
