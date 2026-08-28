import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type { CatalogQuality } from "@/interfaces/DataInterfaces";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

const chartConfig = {
  count: { label: "Productos", color: "var(--chart-4)" },
} satisfies ChartConfig;

const CatalogQualityChart = () => {
  const { getCatalogQuality } = useDataContext();

  const [Quality, setQuality] = useState<CatalogQuality | null>(null);

  useEffect(() => {
    getCatalogQuality().then(setQuality);
  }, [getCatalogQuality]);

  if (!Quality) return null;

  // Cost first: it is the one that quietly breaks every margin and valuation
  // figure elsewhere in this page.
  const gaps = [
    { label: "Sin costo", count: Quality.missingCost, critical: true },
    { label: "Sin precio", count: Quality.missingPrice, critical: true },
    { label: "Sin rubro", count: Quality.missingCategory, critical: false },
    {
      label: "Sin subrubro",
      count: Quality.missingSubcategory,
      critical: false,
    },
    { label: "Sin proveedor", count: Quality.missingProvider, critical: false },
    { label: "Sin imágenes", count: Quality.missingImages, critical: false },
    {
      label: "Sin características",
      count: Quality.missingCharacteristics,
      critical: false,
    },
    {
      label: "Sin medidas",
      count: Quality.missingDimensions,
      critical: false,
    },
  ].filter((gap) => gap.count > 0);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Calidad de Datos del Catálogo</CardTitle>
        <CardDescription>
          {Quality.total} productos · {Quality.active} activos ·{" "}
          {Quality.discontinued} discontinuados · {Quality.withStock} con stock
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        {gaps.length > 0 ? (
          <>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={gaps}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                  tickMargin={6}
                />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" radius={2}>
                  {gaps.map((gap) => (
                    <Cell
                      key={gap.label}
                      fill={gap.critical ? "var(--chart-1)" : "var(--chart-4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            {Quality.missingCost > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Los {Quality.missingCost} productos sin costo se cuentan como
                margen cero en los gráficos de rentabilidad. Cargarles el costo
                es lo que más mejora el resto de esta página.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            El catálogo tiene todos los campos cargados.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CatalogQualityChart;
