import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import jsPDF from "jspdf";
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

  const generateStockPDF = () => {
    const doc = new jsPDF();
    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Diseño 10 Olavarría - Lista de Stock", 10, 20);
    // Date
    const today = new Date().toLocaleDateString("es-AR");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${today}`, 10, 30);
    // Table Headers
    const headers = ["Código", "Fabricante", "Nombre", "Stock", "Precio", "Dimensiones"];
    const columnWidths = [15, 30, 60, 20, 25, 20];
    // Draw table
    let startY = 45;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    headers.forEach((header, index) => {
      doc.text(
        header,
        10 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
        startY,
      );
    });
    // Draw separator line
    doc.setDrawColor(0, 0, 0);
    doc.line(10, startY + 2, 190, startY + 2);
    startY += 10;
    doc.setFont("helvetica", "normal");
    // Draw rows
    products.forEach((product) => {
      const rowData = [
        product.code,
        product.providerName || "N/A",
        product.name,
        `${product.stock.quantity} ${product.saleUnitType}`,
        product.priceBySaleUnit ? `$ ${formatPrice(product.priceBySaleUnit)}` : "N/A",
        product.dimensions || "N/A",
      ];
      doc.setFontSize(8);
      rowData.forEach((text, index) => {
        const xPos = 10 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
        const splitText = doc.splitTextToSize(text, columnWidths[index] - 2);
        doc.text(splitText, xPos, startY);
      });
      startY += 3;
      // Draw light gray separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(10, startY, 190, startY);
      startY += 4;
      // Add new page if Y position exceeds page height
      if (startY > 280) {
        doc.addPage();
        startY = 10;
      }
    });
    // Download PDF
    doc.save(`stock-list-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="px-5 h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Productos en Stock</h2>
        <Button onClick={generateStockPDF}>Descargar stock</Button>
      </div>
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
