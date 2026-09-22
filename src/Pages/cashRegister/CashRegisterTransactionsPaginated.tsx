import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import type { CashRegisterType } from "@/interfaces/CashRegisterInterfaces";
import { REGISTER_TYPE_LABELS, REGISTER_TYPES } from "@/lib/cashRegister";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";
import CashRegisterTransactionTypeFilter from "./CashRegisterTransactionTypeFilter";

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  IN: "Ingreso",
  OUT: "Egreso",
};

const TRANSACTION_ROW_CLASSES: Record<string, string> = {
  IN: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40",
  OUT: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40",
};

const REGISTER_TYPE_FILTER_ALL = "ALL";

const CashRegisterTransactionsPaginated = () => {
  const {
    paginatedTransactions,
    paginatedCurrentPage,
    paginatedTotalPages,
    paginatedTotalElements,
    isPaginatedLoading,
    fetchTransactionsPaginated,
    resetPaginatedTransactions,
    paginatedRegisterTypeFilter,
    setPaginatedRegisterTypeFilter,
    paginatedDirectionFilter,
    setPaginatedDirectionFilter,
  } = useCashRegisterContext();

  // Reloads the first page on mount and whenever a filter changes.
  useEffect(() => {
    resetPaginatedTransactions();
    fetchTransactionsPaginated(
      0,
      paginatedRegisterTypeFilter,
      paginatedDirectionFilter,
    );
  }, [
    fetchTransactionsPaginated,
    resetPaginatedTransactions,
    paginatedRegisterTypeFilter,
    paginatedDirectionFilter,
  ]);

  const handleLoadMore = () => {
    const nextPage = paginatedCurrentPage + 1;
    fetchTransactionsPaginated(nextPage);
  };

  const canLoadMore =
    paginatedCurrentPage < paginatedTotalPages - 1 && !isPaginatedLoading;

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col gap-4 p-2 md:p-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-2">Transacciones de caja</h1>
          <p className="text-sm text-muted-foreground">
            Listado completo de movimientos con carga progresiva.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Select
            value={paginatedRegisterTypeFilter ?? REGISTER_TYPE_FILTER_ALL}
            onValueChange={(value) =>
              setPaginatedRegisterTypeFilter(
                value === REGISTER_TYPE_FILTER_ALL
                  ? null
                  : (value as CashRegisterType),
              )
            }
            disabled={isPaginatedLoading}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={REGISTER_TYPE_FILTER_ALL}>Todos</SelectItem>
              {REGISTER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {REGISTER_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CashRegisterTransactionTypeFilter
            value={paginatedDirectionFilter}
            onChange={setPaginatedDirectionFilter}
            disabled={isPaginatedLoading}
          />
        </div>
      </div>

      <Card className="w-full flex-1 p-2 md:p-6 flex flex-col gap-4 overflow-hidden">
        <div className="text-xs text-muted-foreground">
          Mostrando {paginatedTransactions.length} de {paginatedTotalElements}{" "}
          transacciones
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
              {paginatedTransactions.length === 0 &&
                !isPaginatedLoading &&
                paginatedTotalElements >= 0 && (
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
                    {REGISTER_TYPE_LABELS[transaction.registerType] ??
                      transaction.registerType}
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
