import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | null;
  hint?: string;
  icon: LucideIcon;
}

const StatCard = ({ label, value, hint, icon: Icon }: StatCardProps) => {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex items-center justify-between gap-2">
          {label}
          <Icon className="text-muted-foreground size-4" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value === null ? <Skeleton className="h-8 w-32" /> : value}
        </CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="text-muted-foreground text-xs">{hint}</CardContent>
      )}
    </Card>
  );
};
export default StatCard;
