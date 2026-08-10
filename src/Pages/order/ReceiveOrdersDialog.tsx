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

interface ReceiveOrdersDialogProps {
  /** Orders whose sale units are about to be added to the stock. */
  orders: Order[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * Confirmation shown before receiving one or many orders. It spells out exactly
 * how much stock each product is going to gain, since the operation writes a
 * stock movement per product and is only undone one order at a time.
 */
const ReceiveOrdersDialog = ({
  orders,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: ReceiveOrdersDialogProps) => {
  const isSingle = orders.length === 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSingle
              ? "¿Marcar el pedido como recibido?"
              : `¿Marcar ${orders.length} pedidos como recibidos?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se van a sumar las siguientes cantidades al stock actual de cada
            producto:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{order.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.productCode}
                </p>
              </div>
              <span className="shrink-0 font-medium text-green-600 dark:text-green-500">
                +{order.saleUnitQuantity} {order.saleUnitType}
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

export default ReceiveOrdersDialog;
