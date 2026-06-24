import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShipmentContext } from "@/contexts/shipment/UseShipmentContext";
import type { Shipment } from "@/interfaces/ShipmentInterfaces";
import { formatWednesdayDate, getNextWednesdays } from "@/lib/utils";
import { Search, Trash2 } from "lucide-react";
import DownloadShipmentsButton from "./DownloadShipmentsButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WEDNESDAYS = getNextWednesdays(5);
const NO_DATE = "none";

const ShipmentsList = () => {
  const navigate = useNavigate();
  const { getAllShipments, searchShipments, deleteShipment } =
    useShipmentContext();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string | null>(WEDNESDAYS[0]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const loadForDate = async (d: string | null) => {
    if (!d) {
      setShipments([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getAllShipments(d);
      setShipments(data);
    } catch (error) {
      toast.error("Error al cargar envíos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadForDate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleDateChange = (val: string) => {
    const newDate = val === NO_DATE ? null : val;
    setDate(newDate);
    setSearching(false);
    setQuery("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearching(false);
      loadForDate(date);
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

  const handleClearSearch = () => {
    setQuery("");
    setSearching(false);
    loadForDate(date);
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

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-0 md:pr-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Select value={date ?? NO_DATE} onValueChange={handleDateChange}>
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_DATE}>Sin fecha</SelectItem>
              {WEDNESDAYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {formatWednesdayDate(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {date && (
            <span className="text-sm text-muted-foreground">
              {shipments.length} envío{shipments.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <DownloadShipmentsButton shipments={shipments} date={date} />
      </div>

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

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !date && !searching ? (
        <div className="w-full flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            Seleccioná una fecha para ver los envíos
          </p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="w-full flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">No hay envíos</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4/20">Cliente</TableHead>
              <TableHead className="w-5/20">Dirección</TableHead>
              <TableHead className="w-2/20">Ciudad</TableHead>
              <TableHead className="w-3/20">Teléfono</TableHead>
              <TableHead className="w-1/20">Factura</TableHead>
              <TableHead className="w-3/20">Total</TableHead>
              <TableHead className="w-1/20">Reclamo</TableHead>
              <TableHead className="w-1/20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer"
                onClick={() => navigate(`/shipment/${s.id}`)}
              >
                <TableCell className="font-medium">{s.clientName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {s.address || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.city || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.phone || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.invoice || "-"}
                </TableCell>
                <TableCell>{formatAmount(s.finalAmount)}</TableCell>
                <TableCell>
                  {s.claim ? (
                    <Badge variant="destructive">Sí</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(s.id, e)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ShipmentsList;
