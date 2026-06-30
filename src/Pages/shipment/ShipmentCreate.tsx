import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useShipmentContext } from "@/contexts/shipment/UseShipmentContext";
import type { CreateShipmentDTO } from "@/interfaces/ShipmentInterfaces";
import { formatWednesdayDate, getNextWednesdays } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WEDNESDAYS = getNextWednesdays(5);
const NO_DATE = "none";

const D10_ADDRESS = "Pellegrini n1805. Diseño 10";

const ShipmentCreate = () => {
  const navigate = useNavigate();
  const { createShipment } = useShipmentContext();
  const [loading, setLoading] = useState(false);
  const [isD10, setIsD10] = useState(false);
  const [form, setForm] = useState<CreateShipmentDTO>({
    clientName: "",
    address: "",
    city: "",
    phone: "",
    invoice: "",
    finalAmount: null,
    details: "",
    claim: false,
    shipmentDate: WEDNESDAYS[0],
  });

  const handleD10Change = (checked: boolean) => {
    setIsD10(checked);
    setForm((prev) => ({
      ...prev,
      address: checked ? D10_ADDRESS : "",
      city: checked ? "Olavarría" : "",
    }));
  };

  const set = (field: keyof CreateShipmentDTO) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]:
          field === "finalAmount"
            ? value === "" ? null : Number(value)
            : value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      toast.error("El nombre del cliente es requerido");
      return;
    }
    setLoading(true);
    try {
      await createShipment(form);
      toast.success("Envío creado exitosamente");
      navigate("/shipment");
    } catch (error) {
      toast.error("Error al crear el envío");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Envío</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="clientName">Cliente *</Label>
            <Input
              id="clientName"
              value={form.clientName}
              onChange={set("clientName")}
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={set("phone")}
              placeholder="Número de teléfono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="address">Dirección</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="d10-address"
                  checked={isD10}
                  onCheckedChange={(val) => handleD10Change(val === true)}
                />
                <Label htmlFor="d10-address" className="font-normal cursor-pointer">
                  Diseño 10
                </Label>
              </div>
            </div>
            <Input
              id="address"
              value={form.address}
              onChange={set("address")}
              placeholder="Dirección de envío"
              disabled={isD10}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={form.city}
              onChange={set("city")}
              placeholder="Ciudad"
              disabled={isD10}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Fecha de envío</Label>
            <Select
              value={form.shipmentDate ?? NO_DATE}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  shipmentDate: val === NO_DATE ? null : val,
                }))
              }
            >
              <SelectTrigger className="w-full">
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invoice">Factura</Label>
            <Input
              id="invoice"
              value={form.invoice}
              onChange={set("invoice")}
              placeholder="Número de factura"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="finalAmount">Total</Label>
            <Input
              id="finalAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.finalAmount ?? ""}
              onChange={set("finalAmount")}
              placeholder="Monto final"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="details">Detalles</Label>
          <Textarea
            id="details"
            value={form.details}
            onChange={set("details")}
            placeholder="Detalles del envío..."
            className="resize-none h-28"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="claim"
            checked={form.claim}
            onCheckedChange={(val) =>
              setForm((prev) => ({ ...prev, claim: val === true }))
            }
          />
          <Label htmlFor="claim" className="cursor-pointer">Reclamo</Label>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Envío"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentCreate;
