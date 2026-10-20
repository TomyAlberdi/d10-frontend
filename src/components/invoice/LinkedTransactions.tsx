import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CashRegisterTransaction } from "@/interfaces/CashRegisterInterfaces";
import { REGISTER_TYPE_LABELS } from "@/lib/cashRegister";
import { formatPrice } from "@/lib/utils";

const TYPE_LABELS: Record<CashRegisterTransaction["type"], string> = {
  IN: "Ingreso",
  OUT: "Egreso",
};

const signed = (t: CashRegisterTransaction) =>
  t.type === "OUT" ? -t.amount : t.amount;

/**
 * Cash register transactions linked to a sale, with what they left in the
 * registers. Nothing is rendered when there are none.
 */
const LinkedTransactions = ({
  transactions,
}: {
  transactions: CashRegisterTransaction[];
}) => {
  if (transactions.length === 0) return null;

  const pesos = transactions
    .filter((t) => t.registerType !== "USD")
    .reduce((sum, t) => sum + signed(t), 0);
  const usd = transactions
    .filter((t) => t.registerType === "USD")
    .reduce((sum, t) => sum + signed(t), 0);
  const hasUsd = transactions.some((t) => t.registerType === "USD");

  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Movimientos en caja</h2>
        <p className="text-sm text-muted-foreground">
          Cobrado en caja:{" "}
          <span className="font-medium text-foreground">
            $ {formatPrice(pesos)}
          </span>
          {hasUsd && (
            <span className="font-medium text-foreground">
              {" "}
              · USD {formatPrice(usd)}
            </span>
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Caja</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.dateTime).toLocaleString()}</TableCell>
                <TableCell>{TYPE_LABELS[t.type]}</TableCell>
                <TableCell>
                  {REGISTER_TYPE_LABELS[t.registerType ?? "PAPER"]}
                </TableCell>
                <TableCell className="text-right">
                  {t.registerType === "USD" ? "USD" : "$"}{" "}
                  {formatPrice(t.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default LinkedTransactions;
