import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useShipmentContext } from "@/contexts/shipment/UseShipmentContext";
import type { Shipment } from "@/interfaces/ShipmentInterfaces";
import { MapPin, Phone, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ShipmentsList = () => {
  const navigate = useNavigate();
  const { getAllShipments, searchShipments, deleteShipment } = useShipmentContext();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllShipments();
        setShipments(data);
      } catch (error) {
        toast.error("Error al cargar envíos");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getAllShipments]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearching(false);
      const data = await getAllShipments();
      setShipments(data);
      return;
    }
    setSearching(true);
    try {
      const results = await searchShipments(query.trim());
      setShipments(results);
    } catch (error) {
      toast.error("Error al buscar");
      console.error(error);
    }
  };

  const handleClearSearch = async () => {
    setQuery("");
    setSearching(false);
    try {
      const data = await getAllShipments();
      setShipments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar este envío?")) return;
    try {
      await deleteShipment(id);
      setShipments((prev) => prev.filter((s) => s.id !== id));
      toast.success("Envío eliminado");
    } catch (error) {
      toast.error("Error al eliminar");
      console.error(error);
    }
  };

  const formatAmount = (val: number | null) =>
    val != null ? `$${val.toLocaleString("es-AR")}` : "-";

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-0 md:pr-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar por cliente o factura..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="icon" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
        {searching && (
          <Button type="button" variant="ghost" onClick={handleClearSearch}>
            Limpiar
          </Button>
        )}
      </form>

      {shipments.length === 0 ? (
        <div className="w-full flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">No hay envíos</p>
        </div>
      ) : (
        shipments.map((s) => (
          <Card
            key={s.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/shipment/${s.id}`)}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">{s.clientName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{s.address}, {s.city}</span>
                </div>
                {s.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{s.phone}</span>
                  </div>
                )}
                <div className="flex gap-4 mt-1 text-sm">
                  {s.invoice && (
                    <span className="text-muted-foreground">Factura: <span className="font-medium text-foreground">{s.invoice}</span></span>
                  )}
                  {s.finalAmount != null && (
                    <span className="text-muted-foreground">Total: <span className="font-medium text-foreground">{formatAmount(s.finalAmount)}</span></span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(s.id, e)}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default ShipmentsList;
