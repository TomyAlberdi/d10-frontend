import type { CreateNoteDTO, Note } from "@/interfaces/NoteInterfaces";
import { createContext } from "react";

export interface NoteContextType {
  getNoteById: (id: string) => Promise<Note | null>;
  getAllNotes: () => Promise<Note[]>;
  createNote: (dto: CreateNoteDTO) => Promise<void>;
  updateNote: (id: string, dto: CreateNoteDTO) => Promise<void>;
  deleteNoteById: (id: string) => Promise<void>;
}

export const NoteContext = createContext<NoteContextType | null>(null);
