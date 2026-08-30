import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { CreateOrderDTO, Order } from "@/interfaces/OrderInterfaces";
import type { Product } from "@/interfaces/ProductInterfaces";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { today } from "./orderFormat";

type FormItem = {
  key: number;
  productId: string;
  productCode: string;
  productName: string;
  saleUnitType: Product["saleUnitType"];
  quantity: string;
  detail: string;
};

let nextKey = 0;

const toFormItems = (order: Order): FormItem[] =>
  order.products.map((product) => ({
    key: nextKey++,
    productId: product.productId,
    productCode: product.productCode,
    productName: product.productName,
    saleUnitType: product.saleUnitType,
    quantity: String(product.saleUnitQuantity),
    detail: product.detail ?? "",
  }));

interface OrderFormProps {
  title: string;
  submitLabel: string;
  /** Order being edited. Left out when a new one is being written down. */
  order?: Order;
  /** Saves the order. Reporting the result and navigating away is up to it. */
  onSubmit: (dto: CreateOrderDTO) => Promise<void>;
}

/**
 * The whole order in a single form: a date and the list of products to buy
 * again. Create and edit share it, so both save the order in one request.
 */
const OrderForm = ({ title, submitLabel, order, onSubmit }: OrderFormProps) => {
  const navigate = useNavigate();
  const { listProducts } = useProductContext();

  const [date, setDate] = useState(order?.date ?? today());
  const [items, setItems] = useState<FormItem[]>(() =>
    order ? toFormItems(order) : [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await listProducts(value.trim(), 0, 8);
        setSearchResults(result.content);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectProduct = (product: Product) => {
    if (items.some((item) => item.productId === product.id)) {
      toast.error("Ese producto ya está en el pedido");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        key: nextKey++,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        saleUnitType: product.saleUnitType,
        quantity: "1",
        detail: "",
      },
    ]);
  };

  const updateItem = (key: number, changes: Partial<FormItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...changes } : item)),
    );
  };

  const handleRemoveItem = (key: number) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Elegí la fecha del pedido");
      return;
    }
    if (items.length === 0) {
      toast.error("Agregá al menos un producto al pedido");
      return;
    }
    const hasInvalidQuantity = items.some((item) => {
      const quantity = Number(item.quantity);
      return !Number.isInteger(quantity) || quantity <= 0;
    });
    if (hasInvalidQuantity) {
      toast.error("Todas las cantidades deben ser números enteros mayores a 0");
      return;
    }

    setIsSubmitting(true);
    try {
      // The order travels in one request, so it is saved whole or not at all.
      await onSubmit({
        date,
        products: items.map((item) => ({
          productId: item.productId,
          saleUnitQuantity: Number(item.quantity),
          detail: item.detail.trim() || undefined,
        })),
      });
    } catch {
      // Error already reported by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex justify-center items-start px-3 md:px-0 pt-4">
      <Card className="w-full md:w-2/3 flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 max-w-xs">
            <Label htmlFor="date">Fecha del pedido</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              Productos a pedir
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {items.length}
                </span>
              )}
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Buscá productos abajo para agregarlos al pedido.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col gap-2 p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.productName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.productCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Label
                          htmlFor={`qty-${item.key}`}
                          className="text-sm text-muted-foreground"
                        >
                          {item.saleUnitType}
                        </Label>
                        <Input
                          id={`qty-${item.key}`}
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.key, { quantity: e.target.value })
                          }
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.key)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={item.detail}
                      onChange={(e) =>
                        updateItem(item.key, { detail: e.target.value })
                      }
                      placeholder="Detalle (opcional), por ejemplo: confirmar color"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Buscar producto</h2>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Escribí el nombre o el código del producto..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isSearching}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {isSearching && (
              <p className="text-sm text-muted-foreground">Buscando...</p>
            )}

            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.code} · {product.saleUnitType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock?.quantity ?? 0}
                      </span>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 &&
              !isSearching &&
              searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No se encontraron productos.
                </p>
              )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Guardando..." : submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OrderForm;
