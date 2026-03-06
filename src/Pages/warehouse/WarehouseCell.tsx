import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Cell } from "@/interfaces/WarehouseInterfaces";
import { useNavigate } from "react-router-dom";

const WarehouseCell = ({ cellData }: { cellData: Cell }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/warehouse/cell/${cellData.row}/${cellData.column}`);
  };
  if (
    (cellData.row === 9 && cellData.column === 0) ||
    (cellData.row === 0 &&
      (cellData.column === 0 ||
        cellData.column === 1 ||
        cellData.column === 2)) ||
    (cellData.row === 0 && cellData.column >= 9 && cellData.column <= 14) ||
    (cellData.row === 0 && cellData.column === 19)
  ) {
    return <div className="flex items-center justify-center bg-rose-950" />;
  }

  if (cellData.items.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-gray-800 text-gray-800 select-none cursor-pointer hover:bg-muted hover:text-white hover:border-gray-200"
        onClick={handleClick}
      >
        <span className="text-xs font-medium">
          {`${cellData.row}${cellData.column}`}
        </span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className="flex items-center justify-center border border-gray-200 select-none cursor-pointer hover:bg-muted text-white"
        onClick={handleClick}
      >
        <div>
          <span className="text-xs font-medium">
            {`${cellData.row}${cellData.column}`}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {cellData.items.map((item, index) => (
          <div key={index}>
            {item.product.name}: {item.quantity}
          </div>
        ))}
      </TooltipContent>
    </Tooltip>
  );
};
export default WarehouseCell;
