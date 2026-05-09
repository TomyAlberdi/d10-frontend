import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNoteContext } from "@/contexts/note/UseNoteContext";
import type { CreateNoteDTO, Note } from "@/interfaces/NoteInterfaces";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const NoteUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getNoteById, updateNote, deleteNoteById } = useNoteContext();
  const [note, setNote] = useState<Note | null>(null);
  const [body, setBody] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      if (!id) return;
      try {
        const fetchedNote = await getNoteById(id);
        if (fetchedNote) {
          setNote(fetchedNote);
          setBody(fetchedNote.body);
          setDueDate(fetchedNote.dueDate || null);
        } else {
          toast.error("Nota no encontrada");
          navigate("/note");
        }
      } catch (error) {
        toast.error("Error loading note");
        console.error(error);
        navigate("/note");
      } finally {
        setLoading(false);
      }
    };
    loadNote();
  }, [id, getNoteById, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error("La nota no puede estar vacía");
      return;
    }

    if (!id) return;

    setSaving(true);
    try {
      const dto: CreateNoteDTO = { body, dueDate };
      await updateNote(id, dto);
      toast.success("Nota actualizada exitosamente");
      navigate("/note");
    } catch (error) {
      toast.error("Error updating note");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
      try {
        await deleteNoteById(id);
        toast.success("Nota eliminada");
        navigate("/note");
      } catch (error) {
        toast.error("Error deleting note");
        console.error(error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-4 p-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Nota</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Creada: {formatDate(note.createdAt)}
        {note.updatedAt !== note.createdAt && (
          <>
            <br />
            Actualizada: {formatDate(note.updatedAt)}
          </>
        )}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <Textarea
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
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteUpdate;
