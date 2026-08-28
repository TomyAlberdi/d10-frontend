import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { DeadStock } from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DAY_OPTIONS = [
  { value: "60", label: "Sin ventas hace 60 días" },
  { value: "90", label: "Sin ventas hace 90 días" },
  { value: "180", label: "Sin ventas hace 180 días" },
  { value: "365", label: "Sin ventas hace 1 año" },
];

/** Long tables are for scanning, not scrolling forever. */
const VISIBLE_ROWS = 25;

const DeadStockTable = () => {
  const navigate = useNavigate();
  const { getDeadStock } = useDataContext();

  const [Days, setDays] = useState<string>("90");
  const [Data, setData] = useState<DeadStock | null>(null);

  useEffect(() => {
    getDeadStock(Number(Days)).then(setData);
  }, [getDeadStock, Days]);

  const items = Data?.items ?? [];

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Stock Sin Movimiento</CardTitle>
        <CardDescription>
          {Data
            ? `$ ${formatPrice(Data.totalCostValue)} inmovilizados en ${Data.itemCount} productos`
            : "Calculando…"}
        </CardDescription>
        <div className="pt-2">
          <Select value={Days} onValueChange={setDays}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        {items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead className="w-1/3">Nombre</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Capital</TableHead>
                  <TableHead>Última salida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, VISIBLE_ROWS).map((item) => (
                  <TableRow
                    key={item.productId}
                    className="cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <TableCell>
                      <Badge variant={"secondary"}>{item.code}</Badge>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.unitsOnHand}</TableCell>
                    <TableCell>$ {formatPrice(item.costValue)}</TableCell>
                    <TableCell>
                      {item.daysIdle === null ? (
                        <Badge variant={"destructive"}>Nunca</Badge>
                      ) : (
                        `hace ${item.daysIdle} d`
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {items.length > VISIBLE_ROWS && (
              <p className="text-xs text-muted-foreground mt-3">
                Mostrando {VISIBLE_ROWS} de {items.length} productos.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Todo el stock tuvo movimiento en el periodo seleccionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadStockTable;
