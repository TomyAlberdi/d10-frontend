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
import {
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
  CreditCard,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
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

const REGISTER_TILES = [
  { key: "paper", label: "Efectivo", icon: Banknote },
  { key: "digital", label: "Transferencia", icon: CreditCard },
  { key: "usd", label: "USD", icon: DollarSign },
] as const;

const CashRegisterOverview = () => {
  const {
    paperAmount,
    digitalAmount,
    usdAmount,
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

  const amounts = { paper: paperAmount, digital: digitalAmount, usd: usdAmount };

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col md:flex-row gap-3 md:gap-5 px-2 md:px-5">
      {/* Left: balances + actions */}
      <aside className="w-full md:w-80 shrink-0">
        <Card className="p-5 md:p-6 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold">Caja</h1>
            <p className="text-sm text-muted-foreground">
              Montos actuales registrados.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {REGISTER_TILES.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="truncate text-xl font-bold tracking-tight">
                    {isLoadingAmount ? "…" : `$ ${formatPrice(amounts[key])}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Button onClick={() => navigate("/cash-register/adjust")}>
              <DollarSign />
              Ajustar saldo
            </Button>
            <Button variant="outline" onClick={fetchCurrentAmounts}>
              <RefreshCcw />
              Actualizar
            </Button>
          </div>
        </Card>
      </aside>

      {/* Right: transactions */}
      <div className="flex-1 min-w-0 min-h-0">
        <Card className="h-full p-4 md:p-6 flex flex-col gap-4 overflow-hidden">
          <div>
            <h2 className="text-xl font-bold">Transacciones del día</h2>
            <p className="text-sm text-muted-foreground">
              Seleccione una fecha para ver los movimientos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:w-auto">
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
                className="w-full sm:w-48"
              />
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              {isLoadingDailyTotals ? (
                <span className="text-muted-foreground">Cargando…</span>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <BanknoteArrowUp className="size-4 text-green-600" /> ${" "}
                    {formatPrice(dailyTotals.inTotal)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BanknoteArrowDown className="size-4 text-red-600" /> ${" "}
                    {formatPrice(dailyTotals.outTotal)}
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
                          : "USD"}
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
