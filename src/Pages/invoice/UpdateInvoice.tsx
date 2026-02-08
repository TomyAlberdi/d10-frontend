import { useNavigate, useParams } from "react-router-dom";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import type { CreateInvoiceDTO, InvoiceStatus } from "@/interfaces/InvoiceInterfaces";
import type { CartProduct } from "@/interfaces/CartInterfaces";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { FileText, Trash2 } from "lucide-react";

const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGO", label: "Pago" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "CANCELADO", label: "Cancelado" },
];

function computeTotal(products: CartProduct[], discount: number): number {
  const subtotalSum = products.reduce((sum, p) => sum + p.subtotal, 0);
  return Math.max(0, subtotalSum - discount);
}

const UpdateInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoiceById, updateInvoice } = useInvoiceContext();
  const [invoice, setInvoice] = useState<CreateInvoiceDTO | null>(null);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<InvoiceStatus>("PENDIENTE");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    getInvoiceById(id)
      .then((inv) => {
        if (!cancelled && inv) {
          setInvoice({
            client: inv.client,
            products: inv.products,
            status: inv.status,
            discount: inv.discount,
            total: inv.total,
          });
          setDiscount(inv.discount);
          setStatus(inv.status);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getInvoiceById]);

  const products = invoice?.products ?? [];
  const subtotalSum = products.reduce((sum, p) => sum + p.subtotal, 0);
  const discountPercent =
    subtotalSum > 0 ? (discount / subtotalSum) * 100 : 0;
  const total = computeTotal(products, discount);

  const handleDiscountPercentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percent = Number(e.target.value);
    if (Number.isFinite(percent) && percent >= 0 && percent <= 100 && invoice) {
      setDiscount(subtotalSum * (percent / 100));
    }
  };

  const handleRemoveProduct = (productId: string) => {
    if (!invoice) return;
    setInvoice({
      ...invoice,
      products: invoice.products.filter((p) => p.id !== productId),
    });
  };

  const handleStatusChange = (value: InvoiceStatus) => setStatus(value);

  const handleUpdateInvoice = async () => {
    if (!id || !invoice) return;
    setIsUpdating(true);
    try {
      await updateInvoice(id, {
        client: invoice.client,
        products: invoice.products,
        status,
        discount,
        total,
      });
      toast.success("Factura actualizada correctamente");
      navigate("/invoice");
    } catch {
      // Error handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-muted-foreground">Cargando factura…</p>
      </div>
    );
  }

  if (!id || !invoice) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-muted-foreground">Factura no encontrada</p>
        <Button variant="outline" onClick={() => navigate("/invoice")}>
          Volver a facturas
        </Button>
      </div>
    );
  }

  const hasProducts = invoice.products.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Editar factura #{id}</h1>

      {/* Card 1: Client */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Cliente</h2>
        <div className="text-sm">
          <p className="font-medium">{invoice.client.name}</p>
          <p className="text-muted-foreground">
            {invoice.client.cuitDni}
            {invoice.client.email ? ` · ${invoice.client.email}` : ""}
          </p>
        </div>
      </Card>

      {/* Card 2: Products table */}
      <Card className="p-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-3">Productos</h2>
        {!hasProducts ? (
          <p className="text-muted-foreground text-sm py-4">
            No hay productos en esta factura
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">
                    Cantidad (unidad venta)
                  </TableHead>
                  <TableHead className="text-right">Medida total</TableHead>
                  <TableHead className="text-right">Desc. individual</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">
                      {p.saleUnitQuantity} {p.saleUnitType}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.measureUnitQuantity} {p.measureType}
                    </TableCell>
                    <TableCell className="text-right">
                      $ {formatPrice(p.individualDiscount)}
                    </TableCell>
                    <TableCell className="text-right">
                      $ {formatPrice(p.subtotal)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProduct(p.id)}
                        aria-label="Quitar de la factura"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Card 3: Discount, total, update invoice */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Total y factura</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Descuento sobre total: {Math.round(discountPercent)}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={discountPercent}
              onChange={handleDiscountPercentChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
            />
          </div>
          <div className="text-xl font-semibold pt-2">
            Total: $ {formatPrice(total)}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Estado de la factura
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleUpdateInvoice}
            disabled={!hasProducts || isUpdating}
          >
            <FileText className="size-4 mr-1" />
            {isUpdating ? "Actualizando factura…" : "Actualizar factura"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UpdateInvoice;
