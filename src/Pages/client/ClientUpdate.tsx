import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientContext } from "@/contexts/client/UseClientContext";
import type { CreateClientDTO } from "@/interfaces/ClientInterfaces";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const CLIENT_TYPE_OPTIONS: CreateClientDTO["type"][] = [
  "CONSUMIDOR_FINAL",
  "RESPONSABLE_INSCRIPTO",
];

const ClientUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const { getClientById, updateClient } = useClientContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState<CreateClientDTO["type"]>("CONSUMIDOR_FINAL");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuitDni, setCuitDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const client = await getClientById(id);
        if (cancelled || !client) {
          if (!client) toast.error("Cliente no encontrado");
          return;
        }
        setType(client.type as CreateClientDTO["type"]);
        setName(client.name);
        setAddress(client.address ?? "");
        setCuitDni(client.cuitDni);
        setEmail(client.email ?? "");
        setPhone(client.phone ?? "");
      } catch {
        // Error handled in context
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, getClientById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
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
      await updateClient(id, dto);
      toast.success("Cliente actualizado correctamente");
      navigate("/client");
    } catch {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando cliente…</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar cliente</h1>

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
                      ? "Persona física"
                      : "Responsable inscripto"}
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
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/client")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientUpdate;
