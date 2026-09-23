import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { useClientContext } from "@/contexts/client/UseClientContext";
import type { CreateClientDTO } from "@/interfaces/ClientInterfaces";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CLIENT_TYPE_OPTIONS: CreateClientDTO["type"][] = [
  "CONSUMIDOR_FINAL",
  "RESPONSABLE_INSCRIPTO",
];

const ClientCreate = () => {
  const { createClient } = useClientContext();
  const { setCartClient } = useCartContext();
  const navigate = useNavigate();
  const location = useLocation();
  // Opened from the cart: the new client is assigned to it and the user is
  // taken back there.
  const fromCart = location.state?.fromCart === true;
  const returnPath = fromCart ? "/cart" : "/client";

  const [type, setType] = useState<CreateClientDTO["type"]>("CONSUMIDOR_FINAL");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuitDni, setCuitDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dto: CreateClientDTO = {
        type,
        name: name.trim(),
        address: address.trim(),
        cuitDni: cuitDni.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      const created = await createClient(dto);
      if (fromCart) {
        setCartClient(created);
        toast.success("Cliente creado y asignado al carrito");
      } else {
        toast.success("Cliente creado correctamente");
      }
      navigate(returnPath);
    } catch {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex justify-center items-center p-2 md:p-0">
      <Card className="p-6 w-full md:w-3/4">
        <h1 className="text-2xl font-bold mb-4">Crear cliente</h1>

        <form onSubmit={handleSubmit}>
          <FieldSet className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select
                value={type}
                onValueChange={(v) => setType(v as CreateClientDTO["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "CONSUMIDOR_FINAL"
                        ? "Consumidor Final"
                        : "Responsable Inscripto"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Nombre</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre o razón social"
                required
              />
            </Field>

            <Field>
              <FieldLabel>CUIT / DNI</FieldLabel>
              <Input
                value={cuitDni}
                onChange={(e) => setCuitDni(e.target.value)}
                placeholder="CUIT o DNI"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </Field>

            <Field>
              <FieldLabel>Teléfono</FieldLabel>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono"
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Dirección</FieldLabel>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección"
              />
            </Field>
          </FieldSet>

          <div className="mt-6 flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando…" : "Crear cliente"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(returnPath)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientCreate;
