import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  IN: "Ingreso",
  OUT: "Egreso",
};

const TRANSACTION_ROW_CLASSES: Record<string, string> = {
  IN: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40",
  OUT: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40",
};

const CashRegisterTransactionsPaginated = () => {
  const {
    paginatedTransactions,
    paginatedCurrentPage,
    paginatedTotalPages,
    paginatedTotalElements,
    isPaginatedLoading,
    fetchTransactionsPaginated,
    resetPaginatedTransactions,
  } = useCashRegisterContext();

  useEffect(() => {
    // Load initial transactions on mount
    resetPaginatedTransactions();
    fetchTransactionsPaginated(0);
  }, [fetchTransactionsPaginated, resetPaginatedTransactions]);

  const handleLoadMore = () => {
    const nextPage = paginatedCurrentPage + 1;
    fetchTransactionsPaginated(nextPage);
  };

  const canLoadMore =
    paginatedCurrentPage < paginatedTotalPages - 1 && !isPaginatedLoading;

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Transacciones de caja</h1>
        <p className="text-sm text-muted-foreground">
          Listado completo de movimientos con carga progresiva.
        </p>
      </div>

      <Card className="w-full flex-1 p-6 flex flex-col gap-4 overflow-hidden">

        <div className="text-xs text-muted-foreground">
          Mostrando {paginatedTransactions.length} de {paginatedTotalElements} transacciones
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <TableHead className="w-2/12 bg-card">Fecha y hora</TableHead>
                <TableHead className="w-2/12 bg-card">Tipo</TableHead>
                <TableHead className="w-2/12 bg-card">Caja</TableHead>
                <TableHead className="w-2/12 bg-card">Monto</TableHead>
                <TableHead className="w-4/12 bg-card">Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 && !isPaginatedLoading && paginatedTotalElements >= 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No hay transacciones disponibles
                  </TableCell>
                </TableRow>
              )}
              {paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className={TRANSACTION_ROW_CLASSES[transaction.type] ?? ""}
                >
                  <TableCell>
                    {new Date(transaction.dateTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {TRANSACTION_TYPE_LABELS[transaction.type] ??
                      transaction.type}
                  </TableCell>
                  <TableCell>
                    {transaction.registerType === "PAPER"
                      ? "Efectivo"
                      : transaction.registerType === "DIGITAL"
                        ? "Transferencia"
                        : "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    $ {formatPrice(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.description ?? "—"}</TableCell>
                </TableRow>
              ))}
              {paginatedTransactions.length > 0 && (
                <TableRow className="bg-background hover:bg-background">
                  <TableCell colSpan={5} className="text-center py-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={!canLoadMore}
                      variant={canLoadMore ? "default" : "outline"}
                      className="w-full"
                    >
                      {isPaginatedLoading ? "Cargando..." : "Cargar más"}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterTransactionsPaginated;
