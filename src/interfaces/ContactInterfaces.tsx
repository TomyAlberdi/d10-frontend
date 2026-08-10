export type ContactType = "ARCHITECT" | "DESIGNER" | "PROVIDER" | "PROFESSIONAL";

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  detail: string | null;
  type: ContactType;
}

export interface CreateContactDTO {
  name: string;
  email: string;
  phone: string;
  detail: string;
  type: ContactType;
}

export const CONTACT_TYPES: ContactType[] = [
  "PROFESSIONAL",
  "ARCHITECT",
  "DESIGNER",
  "PROVIDER",
];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  PROFESSIONAL: "Profesional",
  ARCHITECT: "Arquitecto",
  DESIGNER: "Diseñador",
  PROVIDER: "Proveedor",
};
