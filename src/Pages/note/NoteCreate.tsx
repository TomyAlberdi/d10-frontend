import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNoteContext } from "@/contexts/note/UseNoteContext";
import type { CreateNoteDTO } from "@/interfaces/NoteInterfaces";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NoteCreate = () => {
  const navigate = useNavigate();
  const { createNote } = useNoteContext();
  const [body, setBody] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error("La nota no puede estar vacía");
      return;
    }

    setLoading(true);
    try {
      const dto: CreateNoteDTO = { body, dueDate };
      await createNote(dto);
      toast.success("Nota creada exitosamente");
      navigate("/note");
    } catch (error) {
      toast.error("Error creating note");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex justify-center items-center p-2 md:p-0">
      <Card className="w-full md:w-1/3 h-full flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Crear Nota</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          <Textarea
            placeholder="Escribe el contenido de la nota..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 resize-none"
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Fecha Límite (Opcional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate || ""}
              onChange={(e) => setDueDate(e.target.value || null)}
              className="w-fit"
            />
          </div>

          <div className="flex gap-2 justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Nota"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NoteCreate;
