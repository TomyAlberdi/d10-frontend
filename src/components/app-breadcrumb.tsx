import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Spanish labels for each known route segment. Dynamic segments (ids) that are
// not listed here fall back to "Detalle".
const SEGMENT_LABELS: Record<string, string> = {
  product: "Productos",
  client: "Clientes",
  invoice: "Ventas",
  "invoices-by-product": "Ventas por producto",
  cart: "Carrito",
  "cash-register": "Caja",
  data: "Datos",
  note: "Notas",
  shipment: "Envíos",
  // sub-sections
  create: "Crear",
  update: "Editar",
  stock: "Stock",
  packs: "Packs",
  discontinued: "Eliminados",
  "update-price": "Precios",
  add: "Agregar al carrito",
  transactions: "Transacciones",
  adjust: "Ajustar saldo",
  "invoice-transaction": "Registrar pago",
};

const labelFor = (segment: string): string =>
  SEGMENT_LABELS[segment] ?? "Detalle";

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: labelFor(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/">Inicio</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
