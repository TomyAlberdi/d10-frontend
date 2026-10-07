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
  date: "2026-10-02",
  changes: [
    {
      area: "Productos",
      description:
        "Nueva página \"Historial de Precios\", accesible desde el detalle del producto, con un gráfico de la evolución del precio y el costo y una tabla con cada cambio, su origen y la variación porcentual.",
    },
    {
      area: "Stock",
      description:
        "El stock de los productos ahora puede quedar en negativo. Antes de que eso pase se muestra un aviso con el stock disponible, requerido y resultante, y se puede confirmar para continuar.",
    },
    {
      area: "Caja",
      description:
        "Las transacciones de caja ahora se pueden editar: tipo (ingreso o egreso), monto, descripción y, en pesos, si es Efectivo o Transferencia, con una vista previa de cómo queda cada caja.",
    },
    {
      area: "Datos",
      description:
        "Nuevo gráfico de transacciones por mes: en \"Ingresos Mensuales\" se puede elegir Transacciones para ver los ingresos de caja de cada mes, separados en Efectivo y Transferencia.",
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
