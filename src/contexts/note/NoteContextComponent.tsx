import type { CreateNoteDTO, Note } from "@/interfaces/NoteInterfaces";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { NoteContext, type NoteContextType } from "./NoteContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/note`;

interface NoteContextComponentProps {
  children: ReactNode;
}

const NoteContextComponent: React.FC<NoteContextComponentProps> = ({
  children,
}) => {
  const getNoteById = async (id: string): Promise<Note | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Note;
  };

  const getAllNotes = async (): Promise<Note[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Note[];
  };

  const createNote = async (dto: CreateNoteDTO): Promise<void> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const updateNote = async (
    id: string,
    dto: CreateNoteDTO,
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const deleteNoteById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const exportData: NoteContextType = {
    getNoteById,
    getAllNotes,
    createNote,
    updateNote,
    deleteNoteById,
  };

  return (
    <NoteContext.Provider value={exportData}>{children}</NoteContext.Provider>
  );
};

export default NoteContextComponent;
