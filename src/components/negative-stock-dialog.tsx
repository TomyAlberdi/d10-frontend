import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { StockShortage } from "@/lib/negativeStock";
import { TriangleAlert } from "lucide-react";

interface NegativeStockDialogProps {
  /** Products to warn about; the dialog is open while this is not null. */
  shortages: StockShortage[] | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Warning shown before a movement that leaves products below zero, listing
 * what each one has and what it will be left with.
 */
const NegativeStockDialog = ({
  shortages,
  onConfirm,
  onCancel,
}: NegativeStockDialogProps) => {
  return (
    <AlertDialog
      open={shortages !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-amber-500" />
            Stock insuficiente
          </AlertDialogTitle>
          <AlertDialogDescription>
            {shortages?.length === 1
              ? "El siguiente producto va a quedar con stock negativo."
              : "Los siguientes productos van a quedar con stock negativo."}{" "}
            ¿Deseas continuar de todas formas?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
          {shortages?.map((s) => (
            <div
              key={s.productId}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{s.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Disponible: {s.available} · Requerido: {s.required}
                </p>
              </div>
              <span className="shrink-0 font-medium text-red-600 dark:text-red-500">
                {s.resulting} {s.saleUnitType ?? ""}
              </span>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Confirmar igualmente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NegativeStockDialog;
