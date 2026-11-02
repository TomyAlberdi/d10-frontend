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
  date: "2026-11-02",
  changes: [
    {
      area: "Ventas",
      description:
        "El cobro se registra desde el carrito y desde la edición de una venta, sin pantalla aparte: se elige la caja y el monto recibido (precargado con lo que se debe, editable para redondear), y la venta y su cobro se guardan juntos.",
    },
    {
      area: "Ventas",
      description:
        "El estado de la venta se elige con un botón por estado, con los mismos colores que la lista de ventas. \"Pago parcial\" registra un cobro menor al total y deja la venta como deuda; si el cobro cubre el total, se guarda como Pago.",
    },
    {
      area: "Ventas",
      description:
        "Al editar una venta se pueden cambiar las cantidades de los productos, el descuento se elige con los botones 5%, 10%, 15% o \"Personalizado\", y al cancelarla se ofrece devolver en caja lo ya cobrado.",
    },
    {
      area: "Ventas",
      description:
        "El detalle y la edición de una venta muestran sus \"Movimientos en caja\", y en Caja cada movimiento de una venta muestra su número como enlace a ella.",
    },
    {
      area: "Ventas",
      description:
        "En el celular, los filtros de la lista de ventas se abren desde un botón \"Filtros\" en un panel desde abajo. Las ventas de un producto se muestran de la más reciente a la más antigua.",
    },
    {
      area: "Productos",
      description:
        "Nuevo botón de \"Filtros avanzados\" junto a la búsqueda de productos: filtra por medida, fabricante, categoría y subcategoría, y rango de precio, combinado con el texto de búsqueda.",
    },
    {
      area: "Productos",
      description:
        "En el detalle de un producto, el costo y la ganancia quedan ocultos y se muestran con el botón del ojo.",
    },
    {
      area: "General",
      description:
        "La aplicación pide una contraseña al abrirla. Se vuelve a pedir al cerrar la pestaña.",
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
