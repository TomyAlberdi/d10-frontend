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
import type { ProviderPerformanceRecord } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useDataFilters } from "../useDataFilters";

const ProviderPerformanceChart = () => {
  const { getProviderPerformance } = useDataContext();
  const { from, to, basis, year } = useDataFilters();

  const [Records, setRecords] = useState<ProviderPerformanceRecord[]>([]);

  useEffect(() => {
    getProviderPerformance(from, to, basis).then(setRecords);
  }, [getProviderPerformance, from, to, basis]);

  const hasEstimated = Records.some((record) => record.costBasisEstimated);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Rendimiento por Proveedor</CardTitle>
        <CardDescription>
          {year} · ingresos, margen y capital en stock
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {Records.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Proveedor</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>Margen</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Stock al costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Records.map((record) => (
                  <TableRow key={record.providerName}>
                    <TableCell>{record.providerName}</TableCell>
                    <TableCell>$ {formatPrice(record.revenue)}</TableCell>
                    <TableCell>
                      {record.margin !== null
                        ? `${record.costBasisEstimated ? "~ " : ""}$ ${formatPrice(record.margin)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {record.marginPct !== null
                        ? `${record.marginPct.toFixed(1)}%`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{record.unitsSold}</TableCell>
                    <TableCell>{record.skuCount}</TableCell>
                    <TableCell>$ {formatPrice(record.stockValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              {hasEstimated && (
                <>
                  ~ Margen estimado: parte de las ventas es anterior al
                  registro del costo.{" "}
                </>
              )}
              N/A aparece cuando algún producto del proveedor no tiene costo
              cargado, lo que haría inventado el margen del conjunto.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay ventas en el periodo seleccionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderPerformanceChart;
