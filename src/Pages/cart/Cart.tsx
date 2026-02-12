import { useNavigate } from "react-router-dom";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";
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
import { useState } from "react";
import { flushSync } from "react-dom";
import { UserPlus, Trash2, FileText, PackagePlus } from "lucide-react";

const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGO", label: "Pago" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setDiscount, setCartStatus, removeProduct, clearCart } =
    useCartContext();
  const { createInvoice } = useInvoiceContext();
  const { applyInvoiceStatusChange } = useCashRegisterContext();
  const [isCreating, setIsCreating] = useState(false);

  const hasClient = cart.client.id.length > 0;
  const subtotalSum = cart.products.reduce((sum, p) => sum + p.subtotal, 0);
  const discountPercent =
    subtotalSum > 0 ? (cart.discount / subtotalSum) * 100 : 0;
  const canCreateInvoice =
    hasClient && cart.products.length > 0 && cart.total >= 0;

  const handleDiscountPercentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percent = Number(e.target.value);
    if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
      setDiscount(subtotalSum * (percent / 100));
    }
  };

  const handleCreateInvoice = async () => {
    if (!canCreateInvoice) return;
    setIsCreating(true);
    try {
      await createInvoice({
        client: cart.client,
        products: cart.products,
        status: cart.status,
        discount: cart.discount,
        total: cart.total,
      });
      // Apply cash register rule for newly created invoices.
      await applyInvoiceStatusChange({
        invoiceId: undefined,
        previousStatus: null,
        nextStatus: cart.status,
        total: cart.total,
        stockDecreasedInitially: false,
      });
      flushSync(() => {
        clearCart();
      });
      toast.success("Factura creada correctamente");
      navigate("/invoice");
    } catch {
      // Error handled in context
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Carrito</h1>

      {/* Card 1: Client */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Cliente</h2>
        {hasClient ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm">
              <p className="font-medium">{cart.client.name}</p>
              <p className="text-muted-foreground">
                {cart.client.cuitDni}
                {cart.client.email ? ` · ${cart.client.email}` : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/client")}
            >
              <UserPlus className="size-4 mr-1" />
              Cambiar cliente
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-sm">
              No hay cliente seleccionado
            </p>
            <Button onClick={() => navigate("/client")}>
              <UserPlus className="size-4 mr-1" />
              Seleccionar cliente
            </Button>
          </div>
        )}
      </Card>

      {/* Card 2: Products table */}
      <Card className="p-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-3">Productos</h2>
        {cart.products.length === 0 ? (
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-sm py-4">
              No hay productos en el carrito
            </p>
            <Button onClick={() => navigate("/product")}>
              <PackagePlus className="size-4 mr-1" />
              Agregar productos
            </Button>
          </div>
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
                {cart.products.map((p) => (
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
                        onClick={() => removeProduct(p.id)}
                        aria-label="Quitar del carrito"
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

      {/* Card 3: Discount, total, create invoice */}
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
            Total: $ {formatPrice(cart.total)}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Estado de la factura
            </label>
            <Select
              value={cart.status}
              onValueChange={(value) => setCartStatus(value as InvoiceStatus)}
            >
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
            onClick={handleCreateInvoice}
            disabled={!canCreateInvoice || isCreating}
          >
            <FileText className="size-4 mr-1" />
            {isCreating ? "Creando factura…" : "Crear factura"}
          </Button>
          {!hasClient && cart.products.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Selecciona un cliente para poder crear la factura.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Cart;
