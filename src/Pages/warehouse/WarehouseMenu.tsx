import { Input } from "@/components/ui/input";

interface WarehouseMenuProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const WarehouseMenu = ({ searchQuery, setSearchQuery }: WarehouseMenuProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <Input
        placeholder="Buscar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

export default WarehouseMenu;
