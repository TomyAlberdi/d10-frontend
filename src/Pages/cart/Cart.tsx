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
import DiscountPicker from "@/components/invoice/DiscountPicker";
import PaymentCard from "@/components/invoice/PaymentCard";
import type { InvoiceStatus } from "@/interfaces/InvoiceInterfaces";
import {
  PAYMENT_METHOD_REGISTER_TYPE,
  REGISTER_TYPE_PAYMENT_METHOD,
} from "@/lib/cashRegister";
import {
  COLLECTED_STATUSES,
  NO_CLIENT_LABEL,
  resolveInvoiceStatus,
  resolvePayment,
  SELECTABLE_STATUSES,
  type PaymentDraft,
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
import { useNegativeStockConfirm } from "@/hooks/use-negative-stock-confirm";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CartClientSearch from "./CartClientSearch";

const STATUS_LABELS: Partial<Record<InvoiceStatus, string>> = {
  PENDIENTE: "Presupuesto",
  PAGO: "Pago",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

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
  const { run: runWithStockConfirm, dialog: stockConfirmDialog } =
    useNegativeStockConfirm();
  const [isCreating, setIsCreating] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState<PaymentDraft>(() => ({
    enabled: true,
    amount: null,
    registerType: PAYMENT_METHOD_REGISTER_TYPE[cart.paymentMethod ?? "CASH"],
    partial: false,
    pesoAmount: "",
  }));

  // Auto-check stockDecreased when status is "ENTREGADO"
  useEffect(() => {
    if (cart.status === "ENTREGADO") {
      setStockDecreased(true);
    }
  }, [cart.status, setStockDecreased]);

  const cartClient = cart.client;
  const subtotalSum = cart.products.reduce((sum, p) => sum + p.subtotal, 0);
  // Deuda is no longer picked by hand; a cart saved with it reads as Pago.
  const status: InvoiceStatus = SELECTABLE_STATUSES.includes(cart.status)
    ? cart.status
    : "PAGO";

  // A client with a positive balance (credit in their favor) has that credit
  // discounted from this invoice's total, up to the invoice's own amount.
  const clientBalance = cartClient?.balance ?? 0;
  const balanceApplied =
    clientBalance > 0 ? Math.min(clientBalance, cart.total) : 0;
  const finalTotal = Math.max(0, cart.total - balanceApplied);

  // A paid or delivered sale registers its payment together with the sale.
  const showPayment = COLLECTED_STATUSES.includes(status) && finalTotal > 0;
  const resolvedPayment = resolvePayment(paymentDraft, finalTotal);
  const canCreateInvoice =
    cart.products.length > 0 &&
    finalTotal >= 0 &&
    (!showPayment || resolvedPayment.payment !== null);
  // Status the backend will store: a debt when the payment is partial, or
  // when stock leaves without anything being paid.
  const effectiveStatus: InvoiceStatus =
    showPayment && resolvedPayment.isPartial
      ? "DEUDA"
      : resolveInvoiceStatus({
          status,
          total: finalTotal,
          partialPayment: showPayment ? finalTotal : 0,
          stockDecreased: cart.stockDecreased,
        });
  const isForcedToDebt = !showPayment && effectiveStatus !== status;
  const isDebtWithoutClient = effectiveStatus === "DEUDA" && !cartClient;

  const handlePaymentChange = (draft: PaymentDraft) => {
    setPaymentDraft(draft);
    setPaymentMethod(REGISTER_TYPE_PAYMENT_METHOD[draft.registerType]);
  };

  const handleCreateInvoice = async () => {
    if (!canCreateInvoice) return;
    setIsCreating(true);
    try {
      const createdInvoice = await runWithStockConfirm((allowNegativeStock) =>
        createInvoice(
          {
            client: cartClient,
            products: cart.products,
            // The backend turns a partial payment into a debt.
            status: showPayment ? status : effectiveStatus,
            discount: cart.discount,
            total: finalTotal,
            notes: cart.notes,
            paymentMethod: REGISTER_TYPE_PAYMENT_METHOD[paymentDraft.registerType],
            stockDecreased: cart.stockDecreased,
            balanceApplied,
            payment: showPayment
              ? (resolvedPayment.payment ?? undefined)
              : undefined,
          },
          allowNegativeStock,
        ),
      );
      if (!createdInvoice) return;
      flushSync(() => {
        clearCart();
      });
      toast.success("venta creada correctamente");
      navigate("/invoice");
    } catch {
      // Error handled in context
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-3 md:space-y-6">
      {stockConfirmDialog}
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
          <DiscountPicker
            subtotal={subtotalSum}
            discount={cart.discount}
            onChange={setDiscount}
          />
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
              Estado de la venta
            </label>
            <Select
              value={status}
              onValueChange={(value) => setCartStatus(value as InvoiceStatus)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {SELECTABLE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isForcedToDebt && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Se guardará como Deuda: se descuenta stock y quedan ${" "}
                {formatPrice(finalTotal)} sin pagar.
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
        </div>
      </Card>

      {showPayment && (
        <PaymentCard
          owed={finalTotal}
          draft={paymentDraft}
          onChange={handlePaymentChange}
          disabled={isCreating}
        />
      )}

      <Button
        onClick={handleCreateInvoice}
        disabled={!canCreateInvoice || isCreating}
        className="w-full md:w-auto"
      >
        <FileText className="size-4 mr-1" />
        {isCreating
          ? "Creando venta…"
          : showPayment
            ? "Crear venta y registrar cobro"
            : "Crear venta"}
      </Button>
    </div>
  );
};

export default Cart;
