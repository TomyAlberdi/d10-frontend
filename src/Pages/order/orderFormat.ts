// An order written by the application always has a date, but one left in the
// pre migration shape stores it under orderDate and reads back as null. Both
// helpers tolerate that instead of taking the whole list down with them.

/** `yyyy-MM-dd` → `dd/MM/yyyy`. */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
};

/** `yyyy-MM-dd` → `dd-MM`, the short label used on the printed list. */
export const formatShortDate = (value: string | null | undefined): string => {
  if (!value) return "";
  const [, month, day] = value.split("-");
  return day && month ? `${day}-${month}` : value;
};

/** Local `yyyy-MM-dd` for today, avoiding the UTC shift of `toISOString()`. */
export const today = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};
