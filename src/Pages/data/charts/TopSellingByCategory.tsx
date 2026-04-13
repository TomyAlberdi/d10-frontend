import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, getSubcategories } from "@/lib/utils";
import { useEffect, useState } from "react";

const TopSellingByCategory = () => {
  const [SelectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [SelectedSubcategory, setSelectedSubcategory] = useState(
    getSubcategories(SelectedCategory)[0],
  );
  const [SelectedTimespan, setSelectedTimespan] = useState("LAST_MONTH");
  const [SortBy, setSortBy] = useState("GROSS_INCOME");

  useEffect(() => {
    setSelectedSubcategory(getSubcategories(SelectedCategory)[0]);
  }, [SelectedCategory]);

  return (
    <>
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Top 5 Vendidos por Categoría</CardTitle>
          <CardDescription>{SelectedCategory}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={SelectedCategory}
            onValueChange={(v) => {
              setSelectedCategory(v);
              setSelectedSubcategory(CATEGORIES[Number(v)][0]);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={SelectedCategory} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Top 5 Vendidos por Subcategoría</CardTitle>
          <CardDescription>{SelectedSubcategory}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={SelectedSubcategory}
            onValueChange={(v) => setSelectedSubcategory(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={SelectedSubcategory} />
            </SelectTrigger>
            <SelectContent>
              {getSubcategories(SelectedCategory).map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </>
  );
};
export default TopSellingByCategory;
