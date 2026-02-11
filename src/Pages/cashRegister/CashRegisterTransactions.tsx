import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  IN: "Ingreso",
  OUT: "Egreso",
};

const TRANSACTION_ROW_CLASSES: Record<string, string> = {
  IN: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40",
  OUT: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40",
};

const CashRegisterTransactions = () => {
  const { transactions, isLoadingTransactions, fetchTransactions } =
    useCashRegisterContext();
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!selectedDate) return;
    fetchTransactions(selectedDate);
  }, [selectedDate, fetchTransactions]);

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-6xl h-full max-h-[90vh] p-6 flex flex-col gap-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold mb-2">Transacciones de caja</h1>
          <p className="text-sm text-muted-foreground">
            Seleccione una fecha para listar los movimientos registrados.
          </p>
        </div>

        <div className="max-w-sm">
          <label className="block text-sm font-medium mb-1" htmlFor="transaction-date">
            Fecha
          </label>
          <Input
            id="transaction-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <TableHead className="w-2/12 bg-card">Fecha y hora</TableHead>
                <TableHead className="w-2/12 bg-card">Tipo</TableHead>
                <TableHead className="w-2/12 bg-card">Monto</TableHead>
                <TableHead className="w-6/12 bg-card">Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && !isLoadingTransactions && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    {selectedDate
                      ? "No hay transacciones para la fecha seleccionada"
                      : "Seleccione una fecha para ver transacciones"}
                  </TableCell>
                </TableRow>
              )}
              {isLoadingTransactions && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    Cargando transacciones...
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className={TRANSACTION_ROW_CLASSES[transaction.type] ?? ""}
                >
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
                  </TableCell>
                  <TableCell className="font-medium">
                    $ {formatPrice(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.description ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default CashRegisterTransactions;
