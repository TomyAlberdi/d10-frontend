import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteContext } from "@/contexts/note/UseNoteContext";
import type { Note } from "@/interfaces/NoteInterfaces";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NotesList = () => {
  const navigate = useNavigate();
  const { getAllNotes, deleteNoteById } = useNoteContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetchedNotes = await getAllNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        toast.error("Error loading notes");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [getAllNotes]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
      try {
        await deleteNoteById(id);
        setNotes(notes.filter((note) => note.id !== id));
        toast.success("Nota eliminada");
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

  const formatDueDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-lg text-muted-foreground">
          No hay notas disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-y-auto pr-0 md:pr-4">
      {notes.map((note) => {
        return (
          <Card
            key={note.id}
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => navigate(`/note/${note.id}`)}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(note.createdAt)}
                  </p>
                  {note.dueDate && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      Fecha límite: {formatDueDate(note.dueDate)}
                    </Badge>
                  )}
                </div>
                <p className="text-base line-clamp-3 mb-2">{note.body}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note.id);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default NotesList;
