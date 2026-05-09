export interface Note {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

export interface CreateNoteDTO {
  body: string;
  dueDate: string | null;
}
