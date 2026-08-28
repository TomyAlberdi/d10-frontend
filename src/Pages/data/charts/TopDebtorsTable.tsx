import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { Debtor } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopDebtorsTable = () => {
  const navigate = useNavigate();
  const { getTopDebtors } = useDataContext();

  const [Debtors, setDebtors] = useState<Debtor[]>([]);

  useEffect(() => {
    getTopDebtors(10).then(setDebtors);
  }, [getTopDebtors]);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Principales Deudores</CardTitle>
        <CardDescription>Ordenado por saldo pendiente</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {Debtors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Cliente</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Antigüedad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Debtors.map((debtor) => (
                <TableRow
                  key={debtor.clientId ?? debtor.clientName}
                  className="cursor-pointer"
                  title="Ver las ventas de este cliente"
                  onClick={() =>
                    navigate(
                      `/invoice?q=${encodeURIComponent(debtor.clientName)}`,
                    )
                  }
                >
                  <TableCell>{debtor.clientName}</TableCell>
                  <TableCell>$ {formatPrice(debtor.outstanding)}</TableCell>
                  <TableCell>{debtor.paidPct.toFixed(0)}%</TableCell>
                  <TableCell>{debtor.invoiceCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        debtor.oldestInvoiceDays > 90
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {debtor.oldestInvoiceDays} d
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay clientes con deuda pendiente.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopDebtorsTable;
