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
import { Textarea } from "@/components/ui/textarea";
import { useContactContext } from "@/contexts/contact/UseContactContext";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
  type ContactType,
  type CreateContactDTO,
} from "@/interfaces/ContactInterfaces";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ContactUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const { getContactById, updateContact, deleteContactById } =
    useContactContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState<ContactType>("PROFESSIONAL");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const contact = await getContactById(id);
        if (cancelled) return;
        if (!contact) {
          toast.error("Contacto no encontrado");
          navigate("/contact");
          return;
        }
        setName(contact.name);
        setType(contact.type);
        setEmail(contact.email ?? "");
        setPhone(contact.phone ?? "");
        setDetail(contact.detail ?? "");
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
  }, [id, getContactById, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      const dto: CreateContactDTO = {
        name: name.trim(),
        type,
        email: email.trim(),
        phone: phone.trim(),
        detail: detail.trim(),
      };
      await updateContact(id, dto);
      toast.success("Contacto actualizado correctamente");
      navigate("/contact");
    } catch {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este contacto?"))
      return;
    try {
      await deleteContactById(id);
      toast.success("Contacto eliminado");
      navigate("/contact");
    } catch {
      // Error already handled in context
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando contacto…</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center p-2 md:p-0">
      <Card className="p-6 w-full md:w-3/4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Editar contacto</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldSet className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel>Nombre</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del contacto"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ContactType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CONTACT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FieldLabel>Detalle</FieldLabel>
              <Textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Descripción o notas del contacto"
                className="resize-none"
                rows={4}
              />
            </Field>
          </FieldSet>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/contact")}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="sm:ml-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ContactUpdate;
