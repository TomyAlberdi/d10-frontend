import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import type {
  InvoiceStatus,
  PaymentMethod,
} from "@/interfaces/InvoiceInterfaces";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/lib/cashRegister";
import {
  NO_CLIENT_LABEL,
  resolveInvoiceStatus,
  SETTLED_STATUSES,
} from "@/lib/invoice";
import { formatPrice } from "@/lib/utils";
import {
  AlertTriangle,
  FileText,
  PackagePlus,
  PiggyBank,
  Trash2,
  UserPlus,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CartClientSearch from "./CartClientSearch";

const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Presupuesto" },
  { value: "PAGO", label: "Pago" },
  { value: "DEUDA", label: "Deuda" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    setCartClient,
    setDiscount,
    setCartStatus,
    setCartNotes,
    setPaymentMethod,
    setStockDecreased,
    removeProduct,
    updateProduct,
    clearCart,
  } = useCartContext();
  const { createInvoice } = useInvoiceContext();
  const [isCreating, setIsCreating] = useState(false);
  const [partialPayment, setpartialPayment] = useState(0);

  // Auto-check stockDecreased when status is "ENTREGADO"
  useEffect(() => {
    if (cart.status === "ENTREGADO") {
      setStockDecreased(true);
    }
  }, [cart.status, setStockDecreased]);

  const cartClient = cart.client;
  const subtotalSum = cart.products.reduce((sum, p) => sum + p.subtotal, 0);
  const discountPercent =
    subtotalSum > 0 ? (cart.discount / subtotalSum) * 100 : 0;

  // A client with a positive balance (credit in their favor) has that credit
  // discounted from this invoice's total, up to the invoice's own amount.
  const clientBalance = cartClient?.balance ?? 0;
  const balanceApplied =
    clientBalance > 0 ? Math.min(clientBalance, cart.total) : 0;
  const finalTotal = Math.max(0, cart.total - balanceApplied);

  const canCreateInvoice = cart.products.length > 0 && finalTotal >= 0;
  // Status the backend will store, which is a debt when stock leaves without
  // the total being covered.
  const effectiveStatus = resolveInvoiceStatus({
    status: cart.status,
    total: finalTotal,
    partialPayment,
    stockDecreased: cart.stockDecreased,
  });
  const isForcedToDebt = effectiveStatus !== cart.status;
  const isDebtWithoutClient = effectiveStatus === "DEUDA" && !cartClient;

  const handleDiscountPercentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percent = Number(e.target.value);
    if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
      setDiscount(subtotalSum * (percent / 100));
    }
  };

  // A settled sale is fully paid, so the paid amount follows the total that
  // remains after any credit balance is discounted.
  const handleStatusChange = (value: string) => {
    const nextStatus = value as InvoiceStatus;
    setCartStatus(nextStatus);
    if (SETTLED_STATUSES.includes(nextStatus)) {
      setpartialPayment(finalTotal);
    }
  };

  const handleCreateInvoice = async () => {
    if (!canCreateInvoice) return;
    setIsCreating(true);
    try {
      const createdInvoice = await createInvoice({
        client: cartClient,
        products: cart.products,
        status: effectiveStatus,
        discount: cart.discount,
        total: finalTotal,
        notes: cart.notes,
        partialPayment,
        paymentMethod: cart.paymentMethod,
        stockDecreased: cart.stockDecreased,
        balanceApplied,
      });
      flushSync(() => {
        clearCart();
      });
      toast.success("venta creada correctamente");

      // Check if we need to register cash transaction. A debt is left out:
      // partial payments are not registered in the cash register.
      if (SETTLED_STATUSES.includes(effectiveStatus)) {
        navigate("/cash-register/invoice-transaction", {
          state: { invoice: createdInvoice },
        });
      } else {
        navigate("/invoice");
      }
    } catch {
      // Error handled in context
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-3 md:space-y-6">
      <h1 className="text-2xl font-bold">Carrito</h1>
      {/* Card 1: Client */}
      <Card className="p-3 md:p-4">
        <h2 className="text-lg font-semibold mb-0 md:mb-3">Cliente</h2>
        {cartClient ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm">
              <p className="font-medium">{cartClient.name}</p>
              <p className="text-muted-foreground">
                {cartClient.cuitDni}
                {cartClient.email ? ` · ${cartClient.email}` : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCartClient(null)}
            >
              <UserX className="size-4 mr-1" />
              Quitar cliente
            </Button>
            {clientBalance < 0 && (
              <div className="w-full flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Este cliente tiene deudas pendientes: debe ${" "}
                  {formatPrice(Math.abs(clientBalance))}.
                </span>
              </div>
            )}
            {clientBalance > 0 && (
              <div className="w-full flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                <PiggyBank className="size-4 shrink-0 mt-0.5" />
                <span>
                  Este cliente tiene saldo a favor: ${" "}
                  {formatPrice(clientBalance)}. Se descontará del total de
                  esta venta.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Sin cliente: la venta se registrará como {NO_CLIENT_LABEL}.
            </p>
            <div className="flex flex-wrap items-start gap-2">
              <CartClientSearch onSelect={setCartClient} />
              <Button
                variant="outline"
                onClick={() =>
                  navigate("/client/create", { state: { fromCart: true } })
                }
              >
                <UserPlus className="size-4 mr-1" />
                Crear cliente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Card 2: Products table */}
      <Card className="p-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-0 md:mb-3">Productos</h2>
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
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      {p.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={p.saleUnitQuantity}
                          onChange={(e) => {
                            const newQuantity = Number(e.target.value);
                            if (
                              Number.isFinite(newQuantity) &&
                              newQuantity >= 0
                            ) {
                              console.log(p);
                              updateProduct(p.id, newQuantity);
                            }
                          }}
                          className="w-16 border rounded-md px-2 py-1 text-right"
                        />
                        <span className="text-sm text-muted-foreground">
                          {p.saleUnitType}
                        </span>
                      </div>
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
        <h2 className="text-lg font-semibold mb-0 md:mb-3">Total y venta</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Descuento sobre total: {Math.round(discountPercent)}%
            </label>
            {/* Slider for larger screens */}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={discountPercent}
              onChange={handleDiscountPercentChange}
              className="hidden md:block w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
            />
            {/* Number input for mobile */}
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(discountPercent)}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (Number.isFinite(value) && value >= 0 && value <= 100) {
                  setDiscount(subtotalSum * (value / 100));
                }
              }}
              className="md:hidden w-full border rounded-md px-3 py-2"
            />
          </div>
          {balanceApplied > 0 ? (
            <div className="pt-2 space-y-1">
              <div className="text-base text-muted-foreground flex justify-between max-w-xs">
                <span>Total</span>
                <span>$ {formatPrice(cart.total)}</span>
              </div>
              <div className="text-base text-emerald-600 dark:text-emerald-400 flex justify-between max-w-xs">
                <span>Saldo a favor aplicado</span>
                <span>- $ {formatPrice(balanceApplied)}</span>
              </div>
              <div className="text-xl font-semibold flex justify-between max-w-xs">
                <span>Total final</span>
                <span>$ {formatPrice(finalTotal)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xl font-semibold pt-2">
              Total: $ {formatPrice(finalTotal)}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Pago parcial (IMPORTANTE: Los pagos parciales no se registran en
              caja)
            </label>
            <input
              type="number"
              min={0}
              max={finalTotal}
              step="0.01"
              value={partialPayment}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isFinite(value)) {
                  setpartialPayment(0);
                  return;
                }
                setpartialPayment(Math.max(0, Math.min(finalTotal, value)));
              }}
              className="w-full max-w-xs border rounded-md px-3 py-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Saldo pendiente: ${" "}
              {formatPrice(Math.max(0, finalTotal - partialPayment))}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Estado de la venta
            </label>
            <Select value={cart.status} onValueChange={handleStatusChange}>
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
            {isForcedToDebt && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Se guardará como Deuda: se descuenta stock y quedan ${" "}
                {formatPrice(Math.max(0, finalTotal - partialPayment))} sin
                pagar.
              </p>
            )}
            {isDebtWithoutClient && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  La venta se guardará como Deuda sin cliente: la deuda no
                  quedará registrada a nombre de nadie. Selecciona o crea un
                  cliente.
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={cart.stockDecreased || false}
              onCheckedChange={setStockDecreased}
              id="stock-decreased"
            />
            <label
              htmlFor="stock-decreased"
              className="text-sm font-medium text-muted-foreground cursor-pointer"
            >
              Descontar stock de los productos
            </label>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Método de pago
            </label>
            <Select
              value={cart.paymentMethod || "CASH"}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              value={cart.notes || ""}
              onChange={(e) => setCartNotes(e.target.value)}
              placeholder="Agregar comentarios o instrucciones"
            />
          </div>
          <Button
            onClick={handleCreateInvoice}
            disabled={!canCreateInvoice || isCreating}
            className="w-full md:w-auto"
          >
            <FileText className="size-4 mr-1" />
            {isCreating ? "Creando venta…" : "Crear venta"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Cart;
