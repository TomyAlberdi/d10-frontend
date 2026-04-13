import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const getTimeSpanLabel = (timeSpan: TimeSpanEnum) => {
  switch (timeSpan) {
    case "LAST_MONTH":
      return "Últimos 30 días";
    case "LAST_YEAR":
      return "Último Año";
    case "ALL_TIME":
      return "General";
    default:
      return "Último Mes";
  }
};

const BestSellingProducts = () => {
  const navigate = useNavigate();
  const { getBestSellingProducts } = useDataContext();
  const [products, setProducts] = useState<BestSellingProductDTO[]>([]);
  const [SelectedTimespan, setSelectedTimespan] =
    useState<TimeSpanEnum>("LAST_MONTH");
  const [sortBy, setSortBy] = useState<SortByEnum>("GROSS_INCOME");

  useEffect(() => {
    getBestSellingProducts(SelectedTimespan, sortBy).then(setProducts);
  }, [getBestSellingProducts, SelectedTimespan, sortBy]);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>{getTimeSpanLabel(SelectedTimespan)}</CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-5">
        <div className="flex flex-col gap-3 border-2 p-3 rounded-md">
          <span className="text-md">Periodo de Tiempo</span>
          <RadioGroup
            value={SelectedTimespan}
            onValueChange={(value) =>
              setSelectedTimespan(value as TimeSpanEnum)
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="LAST_MONTH" id="last-month" />
              <Label htmlFor="last-month" className="cursor-pointer">
                Últimos 30 días
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="LAST_YEAR" id="last-year" />
              <Label htmlFor="last-year" className="cursor-pointer">
                Último Año
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ALL_TIME" id="all-time" />
              <Label htmlFor="all-time" className="cursor-pointer">
                General
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-3 border-2 p-3 rounded-md">
          <span className="text-md">Ordenar por</span>
          <RadioGroup
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortByEnum)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="GROSS_INCOME" id="gross-income" />
              <Label htmlFor="gross-income" className="cursor-pointer">
                Ingresos Brutos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NET_INCOME" id="net-income" disabled />
              <Label htmlFor="net-income" className="cursor-pointer">
                Ingresos Netos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SALES_AMOUNT" id="sales-amount" />
              <Label htmlFor="sales-amount" className="cursor-pointer">
                Cantidad de Ventas
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardFooter>
      <CardContent className="px-3">
        {products.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead className="w-1/4">Nombre</TableHead>
                <TableHead>N° Ventas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ingresos Brutos</TableHead>
                <TableHead>Ingresos Netos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.product.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/product/${product.product.id}`)}
                >
                  <TableCell>
                    <Badge variant={"secondary"}>{product.product.code}</Badge>
                  </TableCell>
                  <TableCell>{product.product.name}</TableCell>
                  <TableCell>{product.salesAmount}</TableCell>
                  <TableCell>
                    {product.totalSurface.toFixed(2)}{" "}
                    {product.product.measureType}
                  </TableCell>
                  <TableCell>$ {formatPrice(product.totalIncome)}</TableCell>
                  <TableCell>
                    ${" "}
                    {product.netIncome ? formatPrice(product.netIncome) : "N/A"}
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
