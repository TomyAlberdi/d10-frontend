import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { formatPrice } from "@/lib/utils";
import { Eye, PencilLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SelectedInvoiceProps {
  invoice: Invoice | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const SPANISH_MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** Formats a Java LocalDate string (yyyy-MM-dd) to Spanish "13 de Julio de 2026". */
function formatLocalDateToSpanish(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return dateStr;
  const day = d;
  const month = SPANISH_MONTHS[m - 1];
  const year = y;
  return `${day} de ${month} de ${year}`;
}

const SelectedInvoice = ({ invoice }: SelectedInvoiceProps) => {
  const navigate = useNavigate();

  if (!invoice) {
    return (
      <Card className="h-2/6 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No hay venta seleccionada</p>
      </Card>
    );
  }

  const statusLabel = STATUS_LABELS[invoice.status] ?? invoice.status;
  const dateFormatted = invoice.date
    ? formatLocalDateToSpanish(invoice.date)
    : "—";
  const partialPayment = invoice.partialPayment ?? 0;
  const remainingAmount = Math.max(0, invoice.total - partialPayment);

  return (
    <Card className="overflow-hidden flex flex-col gap-1 p-2">
      <div className="col-span-2 flex items-center py-1">
        <span className="text-xl font-bold ml-1">
          venta #{invoice.invoiceNumber ?? invoice.id}
        </span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Fecha</span>
        <span className="text-foreground">{dateFormatted}</span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Cliente</span>
        <span className="text-foreground">{invoice.client.name}</span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Estado</span>
        <span className="text-foreground">{statusLabel}</span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Productos</span>
        <span className="text-foreground">{invoice.products.length}</span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Descuento</span>
        <span className="text-foreground">
          $ {formatPrice(invoice.discount)}
        </span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Total</span>
        <span className="text-foreground font-semibold">
          $ {formatPrice(invoice.total)}
        </span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Pagado</span>
        <span className="text-foreground">$ {formatPrice(partialPayment)}</span>
      </div>
      <div className="py-1 flex items-center gap-3 border-2 px-2">
        <span className="text-muted-foreground">Saldo pendiente</span>
        <span className="text-foreground font-semibold">
          $ {formatPrice(remainingAmount)}
        </span>
      </div>
      <div className="py-1 flex items-center gap-3 flex-wrap">
        <Button
          className="h-full"
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/invoice/${invoice.id}`)}
        >
          <Eye />
          Ver detalle
        </Button>
        <Button
          className="h-full"
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/invoice/${invoice.id}`)}
        >
          <Eye />
          Ver detalle
        </Button>
        <Button
          className="h-full"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/invoice/${invoice.id}/update`)}
        >
          <PencilLine />
          Editar
        </Button>
      </div>
    </Card>
  );
};

export default SelectedInvoice;
