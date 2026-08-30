import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteContext } from "@/contexts/note/UseNoteContext";
import type { Note } from "@/interfaces/NoteInterfaces";
import { cn } from "@/lib/utils";
import { CalendarClock, CirclePlus, StickyNote, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CONTAINER = "w-full h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)]";

/**
 * Today as a local `YYYY-MM-DD`, so it can be compared directly against the
 * plain `dueDate` strings: parsing them with `new Date()` would read them as
 * UTC midnight and drift a day.
 */
const todayISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

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
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const createButton = (
    <Button onClick={() => navigate("/note/create")} className="w-fit">
      <CirclePlus />
      Crear nota
    </Button>
  );

  if (loading) {
    return (
      <div
        className={cn(
          CONTAINER,
          "flex flex-col gap-3 overflow-hidden px-3 pt-3 md:px-0 md:pt-0 md:pr-4",
        )}
      >
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div
        className={cn(
          CONTAINER,
          "flex flex-col items-center justify-center gap-4 px-6 text-center",
        )}
      >
        <div className="rounded-full bg-muted p-4">
          <StickyNote className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium">No hay notas disponibles</p>
          <p className="text-sm text-muted-foreground">
            Crea tu primera nota para empezar.
          </p>
        </div>
        {createButton}
      </div>
    );
  }

  const today = todayISO();

  return (
    <div
      className={cn(
        CONTAINER,
        "flex flex-col gap-3 overflow-x-hidden overflow-y-auto px-3 pt-3 pb-6 md:px-0 md:pt-0 md:pr-4",
      )}
    >
      {createButton}
      {notes.map((note) => {
        const overdue = note.dueDate !== null && note.dueDate < today;
        return (
          <Card
            key={note.id}
            className={cn(
              "shrink-0 cursor-pointer gap-3 border-l-4 p-4 transition-all",
              "hover:ring-foreground/20 hover:shadow-md active:scale-[0.995]",
              overdue
                ? "border-l-red-400 dark:border-l-red-500"
                : note.dueDate
                  ? "border-l-yellow-400 dark:border-l-yellow-500"
                  : "border-l-transparent",
            )}
            onClick={() => navigate(`/note/${note.id}`)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                {formatDate(note.createdAt)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Eliminar nota"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note.id);
                }}
                className="-my-1 -mr-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>

            <p className="line-clamp-3 text-sm break-words whitespace-pre-wrap md:text-base">
              {note.body}
            </p>

            {note.dueDate && (
              <Badge
                variant="secondary"
                className={cn(
                  "max-w-full",
                  overdue
                    ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200",
                )}
              >
                <CalendarClock />
                {overdue ? "Venció" : "Vence"} el {formatDueDate(note.dueDate)}
              </Badge>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default NotesList;
