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
import DiscountPicker from "@/components/invoice/DiscountPicker";
import LinkedTransactions from "@/components/invoice/LinkedTransactions";
import PaymentCard from "@/components/invoice/PaymentCard";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import { useInvoiceContext } from "@/contexts/invoice/UseInvoiceContext";
import type { CashRegisterTransaction } from "@/interfaces/CashRegisterInterfaces";
import type { Client } from "@/interfaces/ClientInterfaces";
import type {
  CreateInvoiceDTO,
  Invoice,
  InvoiceStatus,
} from "@/interfaces/InvoiceInterfaces";
import {
  PAYMENT_METHOD_REGISTER_TYPE,
  REGISTER_TYPE_PAYMENT_METHOD,
} from "@/lib/cashRegister";
import {
  COLLECTED_STATUSES,
  computeTotal,
  invoiceClientName,
  owedAmount,
  resolveInvoiceStatus,
  resolvePayment,
  SELECTABLE_STATUSES,
  updateLineQuantity,
  type PaymentDraft,
} from "@/lib/invoice";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, FileText, Trash2, UserX } from "lucide-react";
import { useNegativeStockConfirm } from "@/hooks/use-negative-stock-confirm";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CartClientSearch from "../cart/CartClientSearch";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDIENTE: "Presupuesto",
  PAGO: "Pago",
  DEUDA: "Deuda",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Tolerance used when comparing amounts: a balance under a cent is paid. */
const PAYMENT_TOLERANCE = 0.01;

const UpdateInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoiceById, updateInvoice } = useInvoiceContext();
  const { getInvoiceTransactions } = useCashRegisterContext();
  const { run: runWithStockConfirm, dialog: stockConfirmDialog } =
    useNegativeStockConfirm();
  const [invoice, setInvoice] = useState<CreateInvoiceDTO | null>(null);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<InvoiceStatus>("PENDIENTE");
  const [stockDecreased, setStockDecreased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
  const [linkedTransactions, setLinkedTransactions] = useState<
    CashRegisterTransaction[]
  >([]);
  const [paymentDraft, setPaymentDraft] = useState<PaymentDraft>({
    enabled: false,
    amount: null,
    registerType: "PAPER",
    partial: false,
    pesoAmount: "",
  });
  const [refundPayments, setRefundPayments] = useState(true);

  // Auto-check stockDecreased when status is "ENTREGADO"
  useEffect(() => {
    if (status === "ENTREGADO" && !stockDecreased) {
      setStockDecreased(true);
    }
  }, [status, stockDecreased]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    getInvoiceById(id)
      .then((inv) => {
        if (!cancelled && inv) {
          setInitialInvoice(inv);
          setInvoice({
            client: inv.client,
            products: inv.products,
            status: inv.status,
            discount: inv.discount,
            total: inv.total,
            notes: inv.notes,
            partialPayment: inv.partialPayment,
            paymentMethod: inv.paymentMethod,
            stockDecreased: inv.stockDecreased,
          });
          setDiscount(inv.discount);
          setStatus(inv.status);
          setStockDecreased(inv.stockDecreased || false);
          setPaymentDraft((prev) => ({
            ...prev,
            registerType:
              PAYMENT_METHOD_REGISTER_TYPE[inv.paymentMethod ?? "CASH"],
          }));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    getInvoiceTransactions(id)
      .then((transactions) => {
        if (!cancelled) setLinkedTransactions(transactions);
      })
      .catch(() => {
        // Error already reported by the context
      });
    return () => {
      cancelled = true;
    };
  }, [id, getInvoiceById, getInvoiceTransactions]);

  const products = invoice?.products ?? [];
  const subtotalSum = products.reduce((sum, p) => sum + p.subtotal, 0);
  const total = computeTotal(products, discount);
  const paidBefore = initialInvoice?.partialPayment ?? 0;
  const owed = owedAmount(total, paidBefore);
  const owedBefore = initialInvoice
    ? owedAmount(initialInvoice.total, paidBefore)
    : 0;

  // The payment card shows whenever a paid, delivered or debt sale still owes
  // something. It is required when this edit leaves more owed than before
  // (e.g. a quote turned into a sale, or a higher total); on a debt that only
  // keeps owing what it did, registering a payment is optional.
  const wasCollected =
    initialInvoice !== null &&
    COLLECTED_STATUSES.includes(initialInvoice.status);
  const paymentRequired =
    COLLECTED_STATUSES.includes(status) &&
    status !== "DEUDA" &&
    owed >= PAYMENT_TOLERANCE &&
    (!wasCollected || owed - owedBefore >= PAYMENT_TOLERANCE);
  const paymentOptional =
    !paymentRequired && status === "DEUDA" && owed >= PAYMENT_TOLERANCE;
  const showPayment = paymentRequired || paymentOptional;
  const isPaying = paymentRequired || (paymentOptional && paymentDraft.enabled);
  const resolvedPayment = resolvePayment(paymentDraft, owed);

  // Status the backend will store: a debt when the payment is partial or
  // when stock leaves without the total being covered.
  const effectiveStatus: InvoiceStatus =
    isPaying && resolvedPayment.isPartial
      ? "DEUDA"
      : resolveInvoiceStatus({
          status,
          total,
          partialPayment: isPaying ? total : paidBefore,
          stockDecreased,
        });
  const isForcedToDebt = !isPaying && effectiveStatus !== status;

  // What the sale's transactions left in the registers, for the refund.
  const collected = linkedTransactions.reduce(
    (sum, t) => sum + (t.type === "OUT" ? -t.amount : t.amount),
    0,
  );
  const canRefund = status === "CANCELADO" && collected >= PAYMENT_TOLERANCE;

  // Deuda (and the old Enviado) are not picked by hand, but a sale that has
  // one keeps it as an option.
  const statusOptions: InvoiceStatus[] =
    initialInvoice && !SELECTABLE_STATUSES.includes(initialInvoice.status)
      ? [...SELECTABLE_STATUSES, initialInvoice.status]
      : [...SELECTABLE_STATUSES];

  // A debt was already charged to its client's balance when it was created,
  // and an edit does not move that charge, so its client stays fixed.
  const isClientLocked = initialInvoice?.status === "DEUDA";

  const handleClientChange = (client: Client | null) => {
    setInvoice((prev) => (prev ? { ...prev, client } : prev));
  };

  const handleRemoveProduct = (productId: string) => {
    setInvoice((prev) =>
      prev
        ? { ...prev, products: prev.products.filter((p) => p.id !== productId) }
        : prev,
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.map((p) =>
              p.id === productId ? updateLineQuantity(p, quantity) : p,
            ),
          }
        : prev,
    );
  };

  const canUpdate =
    products.length > 0 && (!isPaying || resolvedPayment.payment !== null);

  const handleUpdateInvoice = async () => {
    if (!id || !invoice || !canUpdate) return;
    setIsUpdating(true);
    try {
      const updatedInvoice = await runWithStockConfirm((allowNegativeStock) =>
        updateInvoice(
          id,
          {
            client: invoice.client,
            products: invoice.products,
            // The backend turns a partial payment into a debt.
            status: isPaying ? status : effectiveStatus,
            discount,
            total,
            notes: invoice.notes,
            paymentMethod: isPaying
              ? REGISTER_TYPE_PAYMENT_METHOD[paymentDraft.registerType]
              : invoice.paymentMethod,
            stockDecreased,
            payment: isPaying
              ? (resolvedPayment.payment ?? undefined)
              : undefined,
            refundPayments: canRefund && refundPayments,
          },
          allowNegativeStock,
        ),
      );
      if (!updatedInvoice) return;
      toast.success("venta actualizada correctamente");
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
        <p className="text-muted-foreground">Cargando venta…</p>
      </div>
    );
  }

  if (!id || !invoice) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-muted-foreground">venta no encontrada</p>
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft className="bigger-icon" />
        </Button>
      </div>
    );
  }

  const hasProducts = invoice.products.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {stockConfirmDialog}
      <h1 className="text-2xl font-bold">
        Editar venta #{initialInvoice?.invoiceNumber ?? id}
      </h1>

      {/* Card 1: Client */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Cliente</h2>
        {invoice.client ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm">
              <p className="font-medium">{invoiceClientName(invoice.client)}</p>
              <p className="text-muted-foreground">
                {invoice.client.cuitDni}
                {invoice.client.email ? ` · ${invoice.client.email}` : ""}
              </p>
            </div>
            {!isClientLocked && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClientChange(null)}
              >
                <UserX className="size-4 mr-1" />
                Quitar cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Sin cliente: la venta se registra como {invoiceClientName(null)}.
            </p>
            {!isClientLocked && (
              <CartClientSearch onSelect={handleClientChange} />
            )}
          </div>
        )}
        {isClientLocked && (
          <p className="text-muted-foreground text-sm mt-2">
            El cliente de una venta con deuda no se puede cambiar, porque la
            deuda ya está cargada en el saldo del cliente.
          </p>
        )}
      </Card>

      {/* Card 2: Products table */}
      <Card className="p-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-3">Productos</h2>
        {!hasProducts ? (
          <p className="text-muted-foreground text-sm py-4">
            No hay productos en esta venta
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
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={p.saleUnitQuantity}
                          onChange={(e) => {
                            const quantity = Number(e.target.value);
                            if (Number.isFinite(quantity) && quantity >= 0) {
                              handleQuantityChange(p.id, quantity);
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
                        onClick={() => handleRemoveProduct(p.id)}
                        aria-label="Quitar de la venta"
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

      {/* Card 3: Discount, total, status */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Total y venta</h2>
        <div className="space-y-4">
          <DiscountPicker
            subtotal={subtotalSum}
            discount={discount}
            onChange={setDiscount}
          />
          <div className="text-xl font-semibold pt-2">
            Total: $ {formatPrice(total)}
          </div>
          <div className="text-sm space-y-1">
            <p>Pagado: $ {formatPrice(Math.min(total, paidBefore))}</p>
            <p>Saldo pendiente: $ {formatPrice(owed)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Estado de la venta
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as InvoiceStatus)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isForcedToDebt && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Se guardará como Deuda: se descuenta stock y quedan ${" "}
                {formatPrice(owed)} sin pagar.
              </p>
            )}
          </div>
          {canRefund && (
            <div className="flex items-center gap-3">
              <Switch
                checked={refundPayments}
                onCheckedChange={setRefundPayments}
                id="refund-payments"
              />
              <label
                htmlFor="refund-payments"
                className="text-sm font-medium cursor-pointer"
              >
                Devolver $ {formatPrice(collected)} en caja
              </label>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch
              checked={stockDecreased}
              onCheckedChange={setStockDecreased}
              disabled={initialInvoice?.stockDecreased === true}
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
              value={invoice?.notes || ""}
              onChange={(e) =>
                setInvoice((prev) =>
                  prev ? { ...prev, notes: e.target.value } : prev,
                )
              }
              placeholder="Agregar comentarios o instrucciones"
            />
          </div>
        </div>
      </Card>

      {showPayment && (
        <PaymentCard
          owed={owed}
          draft={{ ...paymentDraft, enabled: isPaying }}
          onChange={setPaymentDraft}
          optional={paymentOptional}
          disabled={isUpdating}
        />
      )}

      <LinkedTransactions transactions={linkedTransactions} />

      <Button
        onClick={handleUpdateInvoice}
        disabled={!hasProducts || !canUpdate || isUpdating}
      >
        <FileText className="size-4 mr-1" />
        {isUpdating
          ? "Actualizando venta…"
          : isPaying
            ? "Actualizar venta y registrar cobro"
            : "Actualizar venta"}
      </Button>
    </div>
  );
};

export default UpdateInvoice;
