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
import type { Order } from "@/interfaces/OrderInterfaces";
import { formatDate } from "./orderFormat";

interface ReceiveOrderDialogProps {
  /** Order whose sale units are about to be added to the stock. */
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * Confirmation shown before receiving an order. It spells out exactly how much
 * stock each product is going to gain, since the operation writes a stock
 * movement per product.
 */
const ReceiveOrderDialog = ({
  order,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: ReceiveOrderDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {order
              ? `¿Marcar el pedido del ${formatDate(order.date)} como recibido?`
              : "¿Marcar el pedido como recibido?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se van a sumar las siguientes cantidades al stock actual de cada
            producto:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
          {order?.products.map((product) => (
            <div
              key={product.productId}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{product.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {product.productCode}
                </p>
              </div>
              <span className="shrink-0 font-medium text-green-600 dark:text-green-500">
                +{product.saleUnitQuantity} {product.saleUnitType}
              </span>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // The dialog is closed by the caller once the request settles.
              e.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cargando stock…" : "Confirmar y sumar al stock"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReceiveOrderDialog;
