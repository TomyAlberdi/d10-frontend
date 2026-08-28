import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteContext } from "@/contexts/note/UseNoteContext";
import type { Note } from "@/interfaces/NoteInterfaces";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

/** How far ahead a due date can be for the note to show up on the home card. */
const DUE_WINDOW_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * `dueDate` is a plain `YYYY-MM-DD` string, so it is parsed field by field:
 * `new Date(dueDate)` would read it as UTC midnight and drift a day.
 */
const parseDueDate = (dueDate: string): Date => {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const daysUntilDue = (dueDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (parseDueDate(dueDate).getTime() - today.getTime()) / MS_PER_DAY,
  );
};

const formatDueDate = (dueDate: string) => {
  const [year, month, day] = dueDate.split("-");
  return `${day}/${month}/${year}`;
};

const dueLabel = (days: number): string => {
  if (days < 0) return days === -1 ? "Venció ayer" : `Venció hace ${-days} días`;
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  return `Vence en ${days} días`;
};

export function HomeUpcomingNotes() {
  const { getAllNotes } = useNoteContext();
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

  // Overdue notes first, then the closest due dates.
  const dueNotes = notes
    .flatMap((note) =>
      note.dueDate
        ? [{ note, dueDate: note.dueDate, days: daysUntilDue(note.dueDate) }]
        : [],
    )
    .filter(({ days }) => days <= DUE_WINDOW_DAYS)
    .sort((a, b) => a.days - b.days);

  return (
    <Card className="h-full p-5 md:p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Notas por vencer</h2>
          <p className="text-sm text-muted-foreground">
            Vencidas y con fecha límite en los próximos {DUE_WINDOW_DAYS} días.
          </p>
        </div>
        <Link
          to="/note"
          className="text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground"
        >
          Ver todas
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : dueNotes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            No hay notas por vencer
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-72 md:max-h-80 overflow-y-auto">
          {dueNotes.map(({ note, dueDate, days }) => (
            <Link
              key={note.id}
              to={`/note/${note.id}`}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm line-clamp-2">{note.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fecha límite: {formatDueDate(dueDate)}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={
                  days < 0
                    ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200"
                }
              >
                {dueLabel(days)}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
