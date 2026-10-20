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
  date: "2026-10-14",
  changes: [
    {
      area: "Pedidos",
      description:
        "Nuevo botón \"Sin stock\" en Pedidos: muestra todos los productos con stock en cero o negativo, cuánto ya está pedido de cada uno, y permite elegirlos con su cantidad para crear un pedido nuevo o agregarlos a uno pendiente.",
    },
    {
      area: "Clientes",
      description:
        "Nueva página de detalle del cliente, accesible desde \"Ver detalles\" en el cliente seleccionado, con sus datos, su saldo, todas sus ventas y las acciones \"Ajustar saldo\" y \"Editar\".",
    },
    {
      area: "Clientes",
      description:
        "La búsqueda de clientes muestra el saldo de cada uno y se puede filtrar por \"Saldo a favor\" o \"Con deuda\". La búsqueda, el filtro y el cliente seleccionado se mantienen al cambiar de página.",
    },
    {
      area: "Ventas",
      description:
        "El detalle de una venta tiene un botón \"Ver cliente\" que lleva a la página del cliente. La búsqueda y los filtros de la lista de ventas se mantienen al entrar a una venta y volver.",
    },
    {
      area: "Productos",
      description:
        "Nuevo diseño de la página de productos discontinuados: tarjetas con la imagen, el último precio y el stock restante, un botón \"Reactivar\" en cada una y una barra para buscar por código, nombre o fabricante.",
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
