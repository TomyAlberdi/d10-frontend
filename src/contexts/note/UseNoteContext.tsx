import { useContext } from "react";
import { NoteContext, type NoteContextType } from "./NoteContext";

export const useNoteContext = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNoteContext must be used within a NoteContextComponent");
  }
  return context;
};
