import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ChangeEntry = {
  /** Section of the system the change belongs to. */
  area: string;
  description: string;
};

type Release = {
  /** `YYYY-MM-DD` of the update. */
  date: string;
  changes: ChangeEntry[];
};

/**
 * Written by hand on every update: replace the date and the changes with the
 * ones of the new update, keeping each description user-facing.
 */
const LATEST_RELEASE: Release = {
  date: "2026-11-25",
  changes: [
    {
      area: "Ventas",
      description:
        "Al agregar un producto al carrito, la cantidad se puede escribir en la unidad de venta (por ejemplo, CAJA) o en la de medida (por ejemplo, M2). Al escribir una medida se muestran las cantidades que la cubren, con el sobrante y el precio de cada una, y se elige la menor.",
    },
    {
      area: "Ventas",
      description:
        "El descuento al agregar un producto al carrito se elige con los mismos botones del carrito: 5%, 10%, 15% o \"Personalizado\".",
    },
    {
      area: "Ventas",
      description:
        "En el PDF de una venta, los precios de cada producto se muestran con su descuento aplicado. En los productos que se venden por unidad, la cantidad muestra el total de su medida: 15 unidades de 25kg se muestran como 375kg.",
    },
    {
      area: "Productos",
      description:
        "\"Lista Stock\" y \"Movimientos Stock\" se unen en una sola página \"Stock\", con las pestañas Existencias y Movimientos.",
    },
    {
      area: "Productos",
      description:
        "El stock valorizado, en la página de Stock y en el detalle de un producto, se calcula con el costo del producto en lugar del precio de venta. Los productos sin costo muestran \"-\".",
    },
    {
      area: "Productos",
      description:
        "En Precios, los proveedores se eligen con botones (con \"Todos\" y \"Ninguno\") y el porcentaje de aumento se escribe, con decimales. Si falla la actualización de un proveedor, los ya actualizados se desmarcan, para no aumentarlos dos veces al reintentar.",
    },
    {
      area: "General",
      description: "\"Agenda\" ya no aparece en el menú lateral.",
    },
  ],
};

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export function HomeChangelog() {
  return (
    <Card className="p-5 md:p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold">Novedades</h2>
        <p className="text-sm text-muted-foreground">
          Cambios de la última actualización ({formatDate(LATEST_RELEASE.date)}).
        </p>
      </div>
      <ul className="stagger-in flex flex-col gap-3 max-h-80 overflow-y-auto">
        {LATEST_RELEASE.changes.map((change, i) => (
          <li
            key={i}
            className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 rounded-lg border p-3"
          >
            <Badge
              variant="secondary"
              className="shrink-0 sm:w-24 justify-center"
            >
              {change.area}
            </Badge>
            <p className="text-sm">{change.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
