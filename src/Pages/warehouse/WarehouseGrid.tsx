import { Skeleton } from "@/components/ui/skeleton";
import { useWarehouseContext } from "@/contexts/warehouse/UseWarehouseContext";
import { useOutletContext } from "react-router-dom";
import WarehouseCell from "./WarehouseCell";

interface OutletContextType {
  searchQuery: string;
}

const WarehouseGrid = () => {
  const { Warehouse, isLoading } = useWarehouseContext();
  const { searchQuery } = useOutletContext<OutletContextType>();

  const getCellMatchStatus = (cellIndex: number) => {
    const cell = Warehouse?.cells[cellIndex];
    if (!cell || cell.items.length === 0) return null; // Ignore empty cells
    
    if (!searchQuery.trim()) return true; // No search query = all items match

    const query = searchQuery.toLowerCase();
    return cell.items.some(
      (item) =>
        item.product.name.toLowerCase().includes(query) ||
        item.product.providerName.toLowerCase().includes(query)
    );
  };

  return (
    <section className="w-full h-full">
      <div className="bg-card rounded h-full grid grid-rows-10 grid-cols-20">
        {isLoading ? (
          <Skeleton className="col-span-full row-span-full" />
        ) : (
          Warehouse?.cells.map((cell, index) => {
            const matches = getCellMatchStatus(index);
            return (
              <WarehouseCell
                key={index}
                cellData={cell}
                searchMatches={matches}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default WarehouseGrid;
