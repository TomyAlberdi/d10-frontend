import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { useWarehouseContext } from "@/contexts/warehouse/UseWarehouseContext";
import WarehouseMenu from "@/Pages/warehouse/WarehouseMenu";
import { useState } from "react";
import WarehouseCell from "./WarehouseCell";

const Warehouse = () => {
  const { Warehouse, isLoading } = useWarehouseContext();
  const [CurrentLevel, setCurrentLevel] = useState(0);

  const handleLevelUp = () => {
    if (CurrentLevel < 2) {
      setCurrentLevel(CurrentLevel + 1);
    }
  };

  const handleLevelDown = () => {
    if (CurrentLevel > 0) {
      setCurrentLevel(CurrentLevel - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-start">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
        <WarehouseMenu
          currentLevel={CurrentLevel}
          handleLevelUp={handleLevelUp}
          handleLevelDown={handleLevelDown}
        />
      </section>
      <section className="w-7/8 h-screen p-3 pl-0">
        <div className="bg-card rounded h-full grid grid-rows-10 grid-cols-20">
          {isLoading ? (
            <Skeleton className="col-span-full row-span-full" />
          ) : (
            Warehouse?.cells.map((cell, index) => {
              if (cell.level === CurrentLevel) {
                return <WarehouseCell key={index} cellData={cell} />;
              }
            })
          )}
        </div>
      </section>
    </div>
  );
};
export default Warehouse;
