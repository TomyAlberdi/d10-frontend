import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type {
  BestSellingProductDTO,
  SortByEnum,
  TimeSpanEnum,
} from "@/interfaces/DataInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TIME_SPAN_LABELS: Record<TimeSpanEnum, string> = {
  THIS_MONTH: "Este Mes",
  THIS_YEAR: "Este Año",
  ALL_TIME: "General",
};

const SORT_BY_LABELS: Partial<Record<SortByEnum, string>> = {
  GROSS_INCOME: "Ingresos Brutos",
  NET_INCOME: "Ingresos Netos",
  UNITS_SOLD: "Unidades Vendidas",
};

const BestSellingProducts = () => {
  const navigate = useNavigate();
  const { getBestSellingProducts } = useDataContext();
  const [products, setProducts] = useState<BestSellingProductDTO[] | null>(
    null,
  );
  const [SelectedTimespan, setSelectedTimespan] =
    useState<TimeSpanEnum>("THIS_MONTH");
  const [sortBy, setSortBy] = useState<SortByEnum>("GROSS_INCOME");

  useEffect(() => {
    let ignore = false;
    setProducts(null);
    getBestSellingProducts(SelectedTimespan, sortBy).then((data) => {
      if (!ignore) setProducts(data);
    });
    return () => {
      ignore = true;
    };
  }, [getBestSellingProducts, SelectedTimespan, sortBy]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>
          Top 15 · {TIME_SPAN_LABELS[SelectedTimespan]} · por{" "}
          {SORT_BY_LABELS[sortBy]?.toLowerCase()}
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <Select
            value={SelectedTimespan}
            onValueChange={(v) => setSelectedTimespan(v as TimeSpanEnum)}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_SPAN_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortByEnum)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_BY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-3">
        {products === null ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No hay ventas en este período.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="w-1/3">Nombre</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ingresos Brutos</TableHead>
                <TableHead className="text-right">Ingresos Netos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={product.product.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/product/${product.product.id}`)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Badge variant={"secondary"}>{product.product.code}</Badge>
                  </TableCell>
                  <TableCell>{product.product.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {product.totalSurface.toFixed(2)}{" "}
                    {product.product.measureType}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    $ {formatPrice(product.totalIncome)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {product.netIncome !== null
                      ? `$ ${formatPrice(product.netIncome)}`
                      : "N/A"}
                    {product.costBasisEstimated && product.netIncome !== null && (
                      <span
                        className="text-muted-foreground ml-1"
                        title="Estimado con el costo actual"
                      >
                        *
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
export default BestSellingProducts;
