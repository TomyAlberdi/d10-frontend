import { Button } from "@/components/ui/button";
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
import { BanknoteArrowDown, BanknoteArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  IN: "Ingreso",
  OUT: "Egreso",
};

const TRANSACTION_ROW_CLASSES: Record<string, string> = {
  IN: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40",
  OUT: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40",
};

const CashRegisterOverview = () => {
  const {
    paperAmount,
    digitalAmount,
    isLoadingAmount,
    fetchCurrentAmounts,
    transactions,
    isLoadingTransactions,
    fetchTransactions,
    dailyTotals,
    isLoadingDailyTotals,
    fetchDailyTotals,
  } = useCashRegisterContext();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  useEffect(() => {
    if (selectedDate) {
      fetchTransactions(selectedDate);
      fetchDailyTotals(selectedDate);
    }
  }, [selectedDate, fetchTransactions, fetchDailyTotals]);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Overview Section */}
      <div className="flex justify-center">
        <Card className="w-full max-w-xl p-6 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Caja</h1>
            <p className="text-sm text-muted-foreground">
              Montos actuales registrados en las cajas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-muted-foreground text-lg">
                Caja Efectivo:
              </span>
              {isLoadingAmount ? (
                <span className="text-2xl font-extrabold tracking-tight text-muted-foreground">
                  Cargando...
                </span>
              ) : (
                <span className="text-2xl font-extrabold tracking-tight">
                  $ {formatPrice(paperAmount)}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-muted-foreground text-lg">
                Caja Transferencia:
              </span>
              {isLoadingAmount ? (
                <span className="text-2xl font-extrabold tracking-tight text-muted-foreground">
                  Cargando...
                </span>
              ) : (
                <span className="text-2xl font-extrabold tracking-tight">
                  $ {formatPrice(digitalAmount)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/cash-register/adjust")}
            >
              Ajustar saldo
            </Button>
            <Button variant="outline" onClick={fetchCurrentAmounts}>
              Actualizar montos
            </Button>
          </div>
        </Card>
      </div>

      {/* Transactions Section */}
      <div className="flex-1">
        <Card className="w-full h-full p-6 flex flex-col gap-4 overflow-hidden">
          <div>
            <h1 className="text-2xl font-bold mb-2">Transacciones de caja</h1>
            <p className="text-sm text-muted-foreground">
              Seleccione una fecha para listar los movimientos registrados.
            </p>
          </div>

          <div className="flex gap-5 items-end">
            <div className="w-md">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="transaction-date"
              >
                Fecha
              </label>
              <Input
                id="transaction-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex flex-row items-center gap-3 mb-2">
              {isLoadingDailyTotals ? (
                <span className="text-muted-foreground">
                  Cargando totales...
                </span>
              ) : (
                <>
                  <span className="flex gap-2">
                    <BanknoteArrowUp color="green" /> $ {formatPrice(dailyTotals.inTotal)}
                  </span>
                  <span className="flex gap-2">
                    <BanknoteArrowDown color="red" /> $ {formatPrice(dailyTotals.outTotal)}
                  </span>
                </>
              )}
            </div>
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
                {transactions.length === 0 && !isLoadingTransactions && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
                      colSpan={5}
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
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CashRegisterOverview;
