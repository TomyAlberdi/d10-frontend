import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackContext } from "@/contexts/pack/UsePackContext";
import type { Pack } from "@/interfaces/PackInterfaces";
import { formatPrice } from "@/lib/utils";
import { CirclePlus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PacksList = () => {
  const navigate = useNavigate();
  const { getAllPacks, deletePackById } = usePackContext();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const fetched = await getAllPacks();
        setPacks(fetched);
      } catch (error) {
        toast.error("Error al cargar los packs");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadPacks();
  }, [getAllPacks]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pack?")) {
      try {
        await deletePackById(id);
        setPacks(packs.filter((p) => p.id !== id));
        toast.success("Pack eliminado");
      } catch (error) {
        toast.error("Error al eliminar el pack");
        console.error(error);
      }
    }
  };

  const getPackTotal = (pack: Pack): number =>
    pack.items.reduce(
      (sum, item) => sum + item.priceBySaleUnit * item.quantity,
      0,
    );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-0 md:pr-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          No hay packs disponibles
        </p>
        <Button onClick={() => navigate("/product/packs/create")}>
          <CirclePlus className="w-4 h-4 mr-2" />
          Crear pack
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-auto md:min-h-screen flex flex-col gap-3 md:gap-2 overflow-y-auto px-2">
      <div className="flex justify-end pt-2 md:p-0">
        <Button
          onClick={() => navigate("/product/packs/create")}
          className="w-full md:w-auto h-12 md:h-8 text-xl md:text-base"
        >
          <CirclePlus className="mr-2" size={"4"} />
          Crear pack
        </Button>
      </div>
      {packs.map((pack) => (
        <Card
          key={pack.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/product/packs/${pack.id}`)}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-2">{pack.name}</h3>

              <div className="flex flex-wrap gap-1 mb-3">
                {pack.items.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Sin productos
                  </span>
                ) : (
                  pack.items.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {item.productName} × {item.quantity}
                    </Badge>
                  ))
                )}
              </div>

              <p className="text-base font-medium">
                Total: $ {formatPrice(getPackTotal(pack))}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/packs/${pack.id}/add`);
                }}
                title="Enviar al carrito"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(pack.id);
                }}
                className="text-destructive hover:text-destructive"
                title="Eliminar pack"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PacksList;
