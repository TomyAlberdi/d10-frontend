import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePackContext } from "@/contexts/pack/UsePackContext";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { CreatePackDTO, CreatePackItemDTO } from "@/interfaces/PackInterfaces";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FormItem = {
  key: number;
  productId: string;
  productName: string;
  priceBySaleUnit: number;
  quantity: string;
};

let nextKey = 0;

const PackCreate = () => {
  const navigate = useNavigate();
  const { createPack } = usePackContext();
  const { listProducts } = useProductContext();

  const [name, setName] = useState("");
  const [items, setItems] = useState<FormItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setItems((prev) => [
      ...prev,
      {
        key: nextKey++,
        productId: product.id,
        productName: product.name,
        priceBySaleUnit: product.priceBySaleUnit,
        quantity: "1",
      },
    ]);
  };

  const handleRemoveItem = (key: number) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const handleQuantityChange = (key: number, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: value } : i))
    );
  };

  const getTotal = () =>
    items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity);
      return sum + (Number.isFinite(qty) && qty > 0 ? qty * item.priceBySaleUnit : 0);
    }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre del pack no puede estar vacío");
      return;
    }
    if (items.length === 0) {
      toast.error("Agregá al menos un producto al pack");
      return;
    }
    const invalidItems = items.filter((i) => {
      const qty = parseFloat(i.quantity);
      return !Number.isFinite(qty) || qty <= 0;
    });
    if (invalidItems.length > 0) {
      toast.error("Todas las cantidades deben ser mayores que 0");
      return;
    }

    setLoading(true);
    try {
      const dtoItems: CreatePackItemDTO[] = items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: parseFloat(i.quantity),
        priceBySaleUnit: i.priceBySaleUnit,
      }));
      const dto: CreatePackDTO = { name: name.trim(), items: dtoItems };
      await createPack(dto);
      toast.success("Pack creado exitosamente");
      navigate("/product/packs");
    } catch (error) {
      toast.error("Error al crear el pack");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Crear Pack</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nombre del pack</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pack baño completo"
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Productos del pack</h2>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Buscá productos abajo para agregarlos al pack.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 p-3 border rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      $ {formatPrice(item.priceBySaleUnit)} / unidad
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Label htmlFor={`qty-${item.key}`} className="sr-only">
                      Cantidad
                    </Label>
                    <Input
                      id={`qty-${item.key}`}
                      type="number"
                      min="0.01"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.key, e.target.value)
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
              ))}

              <div className="text-right font-semibold text-base pt-1">
                Total: $ {formatPrice(getTotal())}
              </div>
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
              placeholder="Escribí el nombre del producto..."
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
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.category} · {product.saleUnitType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">
                      $ {formatPrice(product.priceBySaleUnit)}
                    </span>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No se encontraron productos.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creando..." : "Crear Pack"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PackCreate;
