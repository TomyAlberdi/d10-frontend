import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn, formatPrice } from "@/lib/utils";
import jsPDF from "jspdf";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Layers,
  Package,
  Search,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type SortKey = "code" | "name" | "providerName" | "quantity" | "value";
type SortDirection = "asc" | "desc";

const PAGE_SHELL =
  "h-[calc(100dvh-4rem)] md:h-[calc(100dvh-6.5rem)] flex flex-col gap-3 md:gap-4 p-3 md:p-5";

const stockValue = (product: Product): number =>
  product.priceBySaleUnit * product.stock.quantity;

const calculateM2Total = (products: Product[]): number => {
  const total = products
    .filter((product) => product.measureType === "M2")
    .reduce((sum, product) => {
      return sum + product.measurePerSaleUnit * product.stock.quantity;
    }, 0);
  return Math.round(total * 100) / 100;
};

const calculateTotalValue = (products: Product[]): number => {
  const total = products.reduce((sum, product) => sum + stockValue(product), 0);
  return Math.round(total * 100) / 100;
};

const sortableValue = (product: Product, key: SortKey): string | number => {
  switch (key) {
    case "quantity":
      return product.stock.quantity;
    case "value":
      return stockValue(product);
    case "providerName":
      return product.providerName ?? "";
    case "code":
      return product.code ?? "";
    default:
      return product.name ?? "";
  }
};

interface SortableHeadProps {
  label: string;
  columnKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
  align?: "left" | "right";
}

const SortableHead = ({
  label,
  columnKey,
  activeKey,
  direction,
  onSort,
  className,
  align = "left",
}: SortableHeadProps) => {
  const isActive = activeKey === columnKey;
  return (
    <TableHead className={cn("bg-card", className)}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          isActive ? "text-foreground font-medium" : "text-muted-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        {isActive ? (
          direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
};

const ProductStockList = () => {
  const { getProductsWithStock } = useProductContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    getProductsWithStock()
      .then(setProducts)
      .catch((error) => {
        console.error("Error fetching products with stock:", error);
      })
      .finally(() => setLoading(false));
  }, [getProductsWithStock]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? products.filter((product) =>
          [
            product.code,
            product.name,
            product.providerName,
            product.dimensions,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query)),
        )
      : products;

    return [...filtered].sort((a, b) => {
      const left = sortableValue(a, sortKey);
      const right = sortableValue(b, sortKey);
      const comparison =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right), "es", {
              sensitivity: "base",
              numeric: true,
            });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [products, search, sortKey, sortDirection]);

  const m2Total = useMemo(
    () => calculateM2Total(visibleProducts),
    [visibleProducts],
  );
  const totalValue = useMemo(
    () => calculateTotalValue(visibleProducts),
    [visibleProducts],
  );

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    // Numeric columns are most useful highest-first, text columns A-Z.
    setSortDirection(key === "quantity" || key === "value" ? "desc" : "asc");
  };

  const generateStockPDF = () => {
    const doc = new jsPDF();
    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Diseño 10 Tandil - Lista de Stock", 10, 20);
    // Date
    const today = new Date().toLocaleDateString("es-AR");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${today}`, 10, 30);
    // Table Headers
    const headers = [
      "Fabricante",
      "Nombre",
      "Stock",
      "Precio unitario",
      "Precio medida",
      "Dimensiones",
    ];
    const columnWidths = [30, 46, 24, 30, 30, 20];
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
    // Draw rows, following the order and filter currently shown on screen
    visibleProducts.forEach((product) => {
      const rowData = [
        product.providerName || "N/A",
        product.name,
        `${product.stock.quantity} ${product.saleUnitType}`,
        product.priceBySaleUnit
          ? `$ ${formatPrice(product.priceBySaleUnit)}`
          : "N/A",
        product.priceByMeasureUnit
          ? `$ ${formatPrice(product.priceByMeasureUnit)}`
          : "N/A",
        product.dimensions || "N/A",
      ];
      doc.setFontSize(8);
      rowData.forEach((text, index) => {
        const xPos =
          10 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
        // Keep each cell on a single line and hide any overflow
        const [firstLine = ""] = doc.splitTextToSize(
          text,
          columnWidths[index] - 2,
        );
        doc.text(firstLine, xPos, startY);
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
      <div className={PAGE_SHELL}>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full col-span-2 sm:col-span-1" />
        </div>
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  const isSearching = search.trim().length > 0;

  return (
    <div className={PAGE_SHELL}>
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos en stock</h1>
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? `${visibleProducts.length} de ${products.length} productos`
              : `${products.length} productos con stock disponible`}
          </p>
        </div>
        <Button
          onClick={generateStockPDF}
          disabled={visibleProducts.length === 0}
          className="w-full md:w-auto"
        >
          <Download className="size-4" />
          Descargar stock
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 sm:grid-cols-3">
        <Card className="p-3 md:p-4 gap-1 justify-center">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Package className="size-3.5" />
            Productos
          </span>
          <p className="text-2xl font-bold tabular-nums">
            {visibleProducts.length}
          </p>
        </Card>
        <Card className="p-3 md:p-4 gap-1 justify-center">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Layers className="size-3.5" />
            Superficie total
          </span>
          <p className="text-2xl font-bold tabular-nums">
            {m2Total} <span className="text-base font-medium">M2</span>
          </p>
        </Card>
        <Card className="p-3 md:p-4 gap-1 justify-center col-span-2 sm:col-span-1">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Wallet className="size-3.5" />
            Valor total
          </span>
          <p className="text-2xl font-bold tabular-nums">
            $ {formatPrice(totalValue)}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="flex-1 flex flex-col overflow-hidden py-0 gap-0">
        <div className="p-3 border-b shrink-0 flex items-center gap-2">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            type="search"
            placeholder="Buscar por código, nombre, fabricante o dimensiones"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
            aria-label="Buscar productos en stock"
          />
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <SortableHead
                  label="Código"
                  columnKey="code"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="w-1/12"
                />
                <SortableHead
                  label="Nombre"
                  columnKey="name"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="w-4/12"
                />
                <SortableHead
                  label="Fabricante"
                  columnKey="providerName"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="w-2/12 hidden lg:table-cell"
                />
                <SortableHead
                  label="Stock"
                  columnKey="quantity"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="w-2/12"
                />
                <SortableHead
                  label="Stock valorizado"
                  columnKey="value"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="w-2/12 text-right"
                  align="right"
                />
                <TableHead className="w-1/12 bg-card hidden md:table-cell">
                  Dimensiones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-12"
                  >
                    {isSearching
                      ? `No se encontraron productos para "${search.trim()}"`
                      : "No hay productos en stock"}
                  </TableCell>
                </TableRow>
              )}
              {visibleProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <TableCell>
                    <Badge variant="secondary">{product.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {product.providerName || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge className="tabular-nums">
                        {product.stock.quantity} {product.saleUnitType}
                      </Badge>
                      {product.measureType !== product.saleUnitType && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {(product.stock.measureUnitEquivalent ?? 0).toFixed(2)}{" "}
                          {product.measureType}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    $ {formatPrice(stockValue(product))}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {product.dimensions || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ProductStockList;
