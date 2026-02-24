import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">{product.code}</Badge>
                <Badge variant={product.quality === "PRIMERA" ? "default" : "secondary"}>
                  {product.quality}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Dimensiones:</span>
                  <span className="text-sm">{product.dimensions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Precio:</span>
                  <span>${product.priceByMeasureUnit.toFixed(2)} X {product.measureType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Stock:</span>
                  <span className="font-bold text-green-600">
                    {product.stock.quantity} {product.saleUnitType}
                    {product.measureType !== product.saleUnitType && (
                      <> ({(product.measurePerSaleUnit * product.stock.quantity).toFixed(2)} {product.measureType})</>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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