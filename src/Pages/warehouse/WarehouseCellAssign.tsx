import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductContext } from "@/contexts/product/UseProductContext";
import { useWarehouseContext } from "@/contexts/warehouse/UseWarehouseContext";
import type { Product } from "@/interfaces/ProductInterfaces";
import type { Cell, CellItem } from "@/interfaces/WarehouseInterfaces";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PAGE_SIZE = 10;

const WarehouseCellAssign = () => {
  const { level, row, column } = useParams<{
    level: string;
    row: string;
    column: string;
  }>();
  const navigate = useNavigate();
  const { Warehouse, updateCell } = useWarehouseContext();
  const { listProducts } = useProductContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const cell =
    Warehouse?.cells.find(
      (c) => c.row === parseInt(row!) && c.column === parseInt(column!),
    ) || null;

  const [SelectedProducts, setSelectedProducts] = useState<CellItem[]>(
    cell?.items || [],
  );

  useEffect(() => {
    let cancelled = false;
    const query = searchQuery.trim() || null;
    listProducts(query, page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setProducts(result.content);
          setTotalPages(result.totalPages);
        }
      })
      .finally(() => {
        if (!cancelled) {
          // no isSearching
        }
      });
    return () => {
      cancelled = true;
    };
  }, [listProducts, page, searchQuery]);

  const handleAddProduct = (product: Product) => {
    if (!cell) return;
    const newItem: CellItem = { product, quantity: 1 };
    setSelectedProducts([...SelectedProducts, newItem]);
  };

  const handleRemoveItem = (product: Product) => {
    if (!cell) return;
    const updatedItems = SelectedProducts.filter(
      (p) => p.product.id !== product.id,
    );
    setSelectedProducts(updatedItems);
  };

  const handleUpdateItem = (product: Product, newQuantity: number) => {
    if (!cell) return;
    const updatedItems = SelectedProducts.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: newQuantity }
        : item,
    );
    setSelectedProducts(updatedItems);
  };

  const handleSaveCell = async () => {
    if (!cell) return;
    const updatedCell: Cell = { ...cell, items: SelectedProducts };
    await updateCell(updatedCell);
    navigate("/warehouse");
  };

  if (!cell) return <div>Cargando...</div>;

  return (
    <div className="p-5 flex flex-col gap-2 w-full">
      <h1 className="text-2xl mb-2">
        Asignar productos a la ubicación {level}
        {row}
        {column}
      </h1>
      {SelectedProducts.length > 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SelectedProducts.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(item.product, parseInt(e.target.value))
                      }
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleRemoveItem(item.product)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Button className="w-1/3 self-center" onClick={handleSaveCell}>
        <Save />
        Guardar cambios
      </Button>
      <Card className="py-0 p-2 gap-2">
        <CardHeader className="px-0">
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nombre, código, descripción..."
          />
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/12">Código</TableHead>
              <TableHead className="w-3/12">Nombre</TableHead>
              <TableHead className="w-1/12">Medida</TableHead>
              <TableHead className="w-1/12">Fabricante</TableHead>
              <TableHead className="w-2/12">Calidad</TableHead>
              <TableHead className="w-2/12">Dimensiones</TableHead>
              <TableHead className="w-2/12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {product.measurePerSaleUnit} {product.measureType}
                </TableCell>
                <TableCell>{product.providerName}</TableCell>
                <TableCell>{product.quality}</TableCell>
                <TableCell>{product.dimensions}</TableCell>
                <TableCell>
                  <Button onClick={() => handleAddProduct(product)}>
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(0, page - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i)}
                  isActive={i === page}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Card>
    </div>
  );
};

export default WarehouseCellAssign;
