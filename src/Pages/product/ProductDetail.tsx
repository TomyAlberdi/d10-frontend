/* eslint-disable react-hooks/set-state-in-effect */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  Package,
  PackagePlus,
  PencilLine,
  Route,
  RouteOff,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProductById, updateProductDiscontinued } = useProductContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de producto no proporcionado");
      setLoading(false);
      return;
    }

    getProductById(id)
      .then((fetchedProduct) => {
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError("Producto no encontrado");
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setError("Error al cargar el producto");
        toast.error("Error al cargar el producto");
      })
      .finally(() => setLoading(false));
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando producto...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-lg text-destructive">
            {error || "Producto no encontrado"}
          </div>
          <Button onClick={() => navigate("/product")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  const firstImage = product.images?.[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        {product.discontinued && (
          <Badge variant="destructive">Discontinuado</Badge>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="xl:col-span-1 space-y-6">
          {/* Image Section */}
          <Card>
            <CardContent className="p-4">
              {firstImage ? (
                <div
                  className="w-full aspect-square bg-secondary rounded-lg max-h-80"
                  style={{
                    backgroundImage: `url(${firstImage})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ) : (
                <div className="w-full aspect-square bg-secondary rounded-lg flex items-center justify-center max-h-80">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-muted-foreground">
                    Código
                  </label>
                  <span className="text-lg font-semibold">{product.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-muted-foreground">
                    Calidad
                  </label>
                  <Badge
                    variant={
                      product.quality === "PRIMERA" ? "default" : "secondary"
                    }
                  >
                    {product.quality === "PRIMERA" ? "1RA" : "2DA"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-muted-foreground">
                    Proveedor
                  </label>
                  <span className="text-sm">{product.providerName}</span>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Descripción
                  </label>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="flex flex-col gap-3">
              <Button
                onClick={() => navigate(`/product/add/${product.id}`)}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Añadir al Carrito
              </Button>
              <Button
                onClick={() => navigate(`/product/${product.id}/update`)}
                className="w-full"
                size="lg"
              >
                <PencilLine className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate(`/product/${product.id}/stock`)}
              >
                <PackagePlus />
                Actualizar stock
              </Button>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  updateProductDiscontinued(product.id, !product.discontinued);
                }}
              >
                {product.discontinued ? (
                  <>
                    <Route />
                    Reactivar
                  </>
                ) : (
                  <>
                    <RouteOff />
                    Discontinuar
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate(`/invoices-by-product/${product.id}`)}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Ventas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Detailed Information */}
        <div className="xl:col-span-2 space-y-6">
          {/* Pricing and Stock Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Precios y Medidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Unidad Medida
                    </label>
                    <p className="text-lg font-semibold">
                      {product.measureType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Unidad Venta
                    </label>
                    <p className="text-lg font-semibold">
                      {product.saleUnitType}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Precio por Medida
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      $ {formatPrice(product.priceByMeasureUnit)} /{" "}
                      {product.measureType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Precio por Unidad de Venta
                    </label>
                    <p className="text-xl font-semibold">
                      $ {formatPrice(product.priceBySaleUnit)} /{" "}
                      {product.saleUnitType}
                    </p>
                  </div>
                  {product.costByMeasureUnit ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Costo por Unidad de Medida
                        </label>
                        <p className="text-lg">
                          $ {formatPrice(product.costByMeasureUnit)} /{" "}
                          {product.measureType}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Ganancia
                        </label>
                        <p className="text-lg font-semibold text-green-600">
                          {product.profit ? product.profit.toFixed(2) : 0.0} %
                        </p>
                      </div>
                    </>
                  ) : null}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Medida por Unidad de Venta
                    </label>
                    <p className="text-lg">
                      {product.measurePerSaleUnit} {product.measureType} por{" "}
                      {product.saleUnitType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle>Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Cantidad en Stock
                    </label>
                    <p
                      className={`text-2xl font-bold ${product.stock.quantity > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {product.stock.quantity} {product.saleUnitType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Equivalente en Medida
                    </label>
                    <p className="text-lg">
                      {product.stock.measureUnitEquivalent.toFixed(2)}{" "}
                      {product.measureType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Stock Valorizado
                    </label>
                    <p className="text-lg">
                      ${" "}
                      {formatPrice(
                        product.stock.quantity * product.priceBySaleUnit,
                      )}
                    </p>
                  </div>
                </div>

                {product.stock.recordList &&
                  product.stock.recordList.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Historial de Movimientos
                      </label>
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                        {product.stock.recordList
                          .slice(-5)
                          .map((record, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-secondary rounded text-sm"
                            >
                              <span
                                className={`font-medium ${record.type === "IN" ? "text-green-600" : "text-red-600"}`}
                              >
                                {record.type === "IN" ? "Entrada" : "Salida"}
                              </span>
                              <span>{record.quantity} unidades</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Categories and Characteristics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-muted-foreground">
                      Categoría
                    </label>
                    <span className="text-lg font-semibold text-right">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-muted-foreground">
                      Subcategoría
                    </label>
                    <span className="text-lg font-semibold">
                      {product.subcategory}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-muted-foreground">
                      Dimensiones
                    </label>
                    <span className="text-lg font-semibold">
                      {product.dimensions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Characteristics */}
            {product.characteristics && product.characteristics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Características</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {product.characteristics.map((char, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded"
                      >
                        <span className="font-medium text-muted-foreground">
                          {char.key}
                        </span>
                        <span className="font-semibold">{char.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
