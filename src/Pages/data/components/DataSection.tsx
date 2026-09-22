import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DataSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  /** Controls shared by every chart of the section, shown on the right. */
  actions?: ReactNode;
  children: ReactNode;
}

const DataSection = ({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: DataSectionProps) => {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 border-b pb-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold leading-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
};
export default DataSection;
