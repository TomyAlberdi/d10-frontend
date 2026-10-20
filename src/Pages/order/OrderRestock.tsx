import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useOrderContext } from "@/contexts/order/UseOrderContext";
import type { Order, RestockProduct } from "@/interfaces/OrderInterfaces";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDate, today } from "./orderFormat";

/** Value of the target select that stands for "write down a new order". */
const NEW_ORDER = "NEW";
const ALL_PROVIDERS = "ALL";

/**
 * A starting amount for each product: enough to bring a negative stock back to
 * zero, or a single unit when it is already at zero.
 */
const suggestedQuantity = (product: RestockProduct): string =>
  String(Math.max(1, -product.stockQuantity));

/**
 * Every active product with zero, negative or no stock, to pick the ones that
 * have to be bought again and add them to a new order or a pending one.
 */
const OrderRestock = () => {
  const navigate = useNavigate();
  const { getRestockProducts, getOrders, createOrder, addOrderProducts } =
    useOrderContext();

  const [products, setProducts] = useState<RestockProduct[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState(ALL_PROVIDERS);
  const [hideAlreadyOrdered, setHideAlreadyOrdered] = useState(false);
  const [target, setTarget] = useState(NEW_ORDER);

  // Ticked products, and the amount typed for each row (ticked or not, so the
  // amount survives unticking and ticking again).
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRestockProducts(), getOrders()])
      .then(([restock, orders]) => {
        if (cancelled) return;
        setProducts(restock);
        setPendingOrders(orders.filter((order) => !order.received));
        setQuantities(
          Object.fromEntries(
            restock.map((product) => [
              product.productId,
              suggestedQuantity(product),
            ]),
          ),
        );
      })
      .catch(() => {
        // Error already reported by the context
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const providers = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((product) => product.providerName)
            .filter((name): name is string => !!name),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const targetOrder = pendingOrders.find((order) => order.id === target);
  // A product can only appear once per order, so the lines the chosen order
  // already has can't be picked again.
  const inTargetOrder = useMemo(
    () =>
      new Set(targetOrder?.products.map((product) => product.productId) ?? []),
    [targetOrder],
  );

  const visibleProducts = products.filter((product) => {
    if (provider !== ALL_PROVIDERS && product.providerName !== provider)
      return false;
    if (hideAlreadyOrdered && product.pendingQuantity > 0) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      product.productName.toLowerCase().includes(query) ||
      product.productCode.toLowerCase().includes(query)
    );
  });
  const selectableVisible = visibleProducts.filter(
    (product) => !inTargetOrder.has(product.productId),
  );
  const allVisibleSelected =
    selectableVisible.length > 0 &&
    selectableVisible.every((product) => selected.has(product.productId));
  const someVisibleSelected = selectableVisible.some((product) =>
    selected.has(product.productId),
  );

  // Products left ticked from before switching to an order that already has
  // them are dropped from what gets sent.
  const toAdd = products.filter(
    (product) =>
      selected.has(product.productId) && !inTargetOrder.has(product.productId),
  );

  const toggleProduct = (productId: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const product of selectableVisible) {
        if (checked) next.add(product.productId);
        else next.delete(product.productId);
      }
      return next;
    });
  };

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
    // Typing an amount means the product is wanted.
    toggleProduct(productId, true);
  };

  const handleSubmit = async () => {
    if (toAdd.length === 0) {
      toast.error("Elegí al menos un producto");
      return;
    }
    const hasInvalidQuantity = toAdd.some((product) => {
      const quantity = Number(quantities[product.productId]);
      return !Number.isInteger(quantity) || quantity <= 0;
    });
    if (hasInvalidQuantity) {
      toast.error("Todas las cantidades deben ser números enteros mayores a 0");
      return;
    }
    const lines = toAdd.map((product) => ({
      productId: product.productId,
      saleUnitQuantity: Number(quantities[product.productId]),
    }));

    setIsSubmitting(true);
    try {
      const order = targetOrder
        ? await addOrderProducts(targetOrder.id, lines)
        : await createOrder({ date: today(), products: lines });
      toast.success(
        targetOrder
          ? `${lines.length} producto(s) agregado(s) al pedido del ${formatDate(order.date)}`
          : "Pedido creado exitosamente",
      );
      // Straight to the order, to review the amounts or add details.
      navigate(`/order/${order.id}`);
    } catch {
      // Error already reported by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col gap-3 md:gap-4 p-3 md:p-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/order")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Productos sin stock</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Cargando…"
              : `${products.length} producto${products.length !== 1 ? "s" : ""} con stock en cero o negativo`}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <div className="relative md:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-8"
          />
        </div>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROVIDERS}>Todos los proveedores</SelectItem>
            {providers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch
            id="hide-ordered"
            checked={hideAlreadyOrdered}
            onCheckedChange={setHideAlreadyOrdered}
          />
          <Label htmlFor="hide-ordered" className="text-sm font-normal">
            Ocultar los que ya están en un pedido pendiente
          </Label>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden py-0 gap-0">
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <TableHead className="w-10 bg-card">
                  <Checkbox
                    aria-label="Elegir todos los visibles"
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    disabled={selectableVisible.length === 0}
                    onCheckedChange={(checked) =>
                      toggleAllVisible(checked === true)
                    }
                  />
                </TableHead>
                <TableHead className="bg-card">Producto</TableHead>
                <TableHead className="hidden md:table-cell bg-card">
                  Proveedor
                </TableHead>
                <TableHead className="text-right bg-card">Stock</TableHead>
                <TableHead className="hidden sm:table-cell bg-card">
                  En pedidos
                </TableHead>
                <TableHead className="w-32 bg-card">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    {isLoading
                      ? "Cargando productos…"
                      : products.length === 0
                        ? "No hay productos sin stock"
                        : "Ningún producto coincide con los filtros"}
                  </TableCell>
                </TableRow>
              )}
              {visibleProducts.map((product) => {
                const alreadyInTarget = inTargetOrder.has(product.productId);
                const isSelected =
                  selected.has(product.productId) && !alreadyInTarget;
                return (
                  <TableRow
                    key={product.productId}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() =>
                      !alreadyInTarget &&
                      toggleProduct(product.productId, !isSelected)
                    }
                    className={
                      alreadyInTarget
                        ? "opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Elegir ${product.productName}`}
                        checked={isSelected}
                        disabled={alreadyInTarget}
                        onCheckedChange={(checked) =>
                          toggleProduct(product.productId, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="max-w-0 w-full">
                      <p className="font-medium truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.productCode}
                        <span className="md:hidden">
                          {product.providerName
                            ? ` · ${product.providerName}`
                            : ""}
                        </span>
                      </p>
                      {alreadyInTarget && (
                        <p className="text-xs text-muted-foreground">
                          Ya está en este pedido
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm whitespace-nowrap">
                      {product.providerName || "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium whitespace-nowrap ${
                        product.stockQuantity < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {product.stockQuantity}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {product.saleUnitType}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {product.pendingQuantity > 0 ? (
                        <Badge variant="secondary">
                          {product.pendingQuantity} {product.saleUnitType}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        aria-label={`Cantidad de ${product.productName}`}
                        value={quantities[product.productId] ?? ""}
                        disabled={alreadyInTarget}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.productId,
                            e.target.value,
                          )
                        }
                        className="w-24"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
        <Label className="text-sm text-muted-foreground shrink-0">
          Agregar a
        </Label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NEW_ORDER}>Nuevo pedido (hoy)</SelectItem>
            {pendingOrders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                Pedido del {formatDate(order.date)} · {order.products.length}{" "}
                producto{order.products.length !== 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || toAdd.length === 0}
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? "Guardando..."
            : targetOrder
              ? `Agregar ${toAdd.length} producto${toAdd.length !== 1 ? "s" : ""}`
              : `Crear pedido con ${toAdd.length} producto${toAdd.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
};

export default OrderRestock;
