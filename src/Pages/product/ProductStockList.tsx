import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductStockList = () => {
  const { getProductsWithStock } = useProductContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductsWithStock()
      .then(setProducts)
      .catch((error) => {
        console.error("Error fetching products with stock:", error);
      })
      .finally(() => setLoading(false));
  }, [getProductsWithStock]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="px-5 h-full flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Productos en Stock</h2>
      <div className="bg-card p-2 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
              <TableHead className="w-1/12">Código</TableHead>
              <TableHead className="w-1/12">Fabricante</TableHead>
              <TableHead className="w-4/12">Nombre</TableHead>
              <TableHead className="w-2/12">Stock</TableHead>
              <TableHead className="w-2/12">Precio</TableHead>
              <TableHead className="w-2/12">Dimensiones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className="cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <TableCell>
                  <Badge variant={"secondary"}>{product.code}</Badge>
                </TableCell>
                <TableCell>{product.providerName}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Badge>{product.stock.quantity} {product.saleUnitType}</Badge>
                </TableCell>
                <TableCell>
                  {product.priceBySaleUnit && (
                    <>$ {formatPrice(product.priceBySaleUnit)}</>
                  )}
                </TableCell>
                <TableCell>{product.dimensions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {products.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No hay productos en stock
        </div>
      )}
    </div>
  );
};

export default ProductStockList;
