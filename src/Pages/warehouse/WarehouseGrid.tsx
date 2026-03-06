import { Skeleton } from "@/components/ui/skeleton";
import { useWarehouseContext } from "@/contexts/warehouse/UseWarehouseContext";
import WarehouseCell from "./WarehouseCell";

const WarehouseGrid = () => {
  const { Warehouse, isLoading } = useWarehouseContext();

  return (
    <section className="w-full h-full">
      <div className="bg-card rounded h-full grid grid-rows-10 grid-cols-20">
        {isLoading ? (
          <Skeleton className="col-span-full row-span-full" />
        ) : (
          Warehouse?.cells.map((cell, index) => {
            return <WarehouseCell key={index} cellData={cell} />;
          })
        )}
      </div>
    </section>
  );
};

export default WarehouseGrid;
