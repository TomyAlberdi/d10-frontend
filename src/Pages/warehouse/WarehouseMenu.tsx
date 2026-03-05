import { ChevronDown, ChevronUp, Layers, Layers2, Square } from "lucide-react";

const WarehouseMenu = ({
  currentLevel,
  handleLevelUp,
  handleLevelDown,
}: {
  currentLevel: number;
  handleLevelUp: () => void;
  handleLevelDown: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-full flex flex-col items-center justify-center gap-2">
        <div
          className="bg-white rounded w-full h-10 flex items-center justify-center cursor-pointer"
          onClick={handleLevelUp}
        >
          <ChevronUp className="large-icon" color="black" />
        </div>
        <div className="flex flex-col justify-center items-center my-1 gap-2">
          <span className="text-xl">Nivel</span>
          <div className="flex justify-center items-center gap-3">
            {currentLevel === 0 ? (
              <Square className="large-icon" />
            ) : currentLevel === 1 ? (
              <Layers2 className="large-icon" />
            ) : (
              <Layers className="large-icon" />
            )}
            <span className="text-xl">{currentLevel + 1}</span>
          </div>
        </div>
        <div
          className="bg-white rounded w-full h-10 flex items-center justify-center cursor-pointer"
          onClick={handleLevelDown}
        >
          <ChevronDown className="large-icon" color="black" />
        </div>
      </div>
    </div>
  );
};

export default WarehouseMenu;
