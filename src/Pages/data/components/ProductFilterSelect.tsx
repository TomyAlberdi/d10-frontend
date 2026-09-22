import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFilter } from "@/interfaces/DataInterfaces";
import { CATEGORIES, getSubcategories } from "@/lib/utils";
import { FilterX } from "lucide-react";

/** Radix Select cannot hold an empty value, so "all" gets a sentinel. */
const ALL = "__ALL__";

interface ProductFilterSelectProps {
  value: ProductFilter;
  onChange: (filter: ProductFilter) => void;
}

const ProductFilterSelect = ({ value, onChange }: ProductFilterSelectProps) => {
  const category = value.category ?? "";
  const subcategory = value.subcategory ?? "";
  const subcategories = getSubcategories(category);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={category || ALL}
        onValueChange={(v) =>
          onChange({ category: v === ALL ? undefined : v, subcategory: undefined })
        }
      >
        <SelectTrigger size="sm" className="w-48">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las categorías</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={subcategory || ALL}
        onValueChange={(v) =>
          onChange({ category: value.category, subcategory: v === ALL ? undefined : v })
        }
        disabled={!category}
      >
        <SelectTrigger size="sm" className="w-44">
          <SelectValue placeholder="Subcategoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las subcategorías</SelectItem>
          {subcategories.map((sub) => (
            <SelectItem key={sub} value={sub}>
              {sub}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(category || subcategory) && (
        <Button
          size="icon-sm"
          variant="ghost"
          title="Quitar filtro"
          onClick={() => onChange({})}
        >
          <FilterX />
        </Button>
      )}
    </div>
  );
};
export default ProductFilterSelect;
