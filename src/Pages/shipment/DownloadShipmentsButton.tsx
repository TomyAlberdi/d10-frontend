import { Button } from "@/components/ui/button";
import type { Shipment } from "@/interfaces/ShipmentInterfaces";
import { Download } from "lucide-react";

interface Props {
  shipments: Shipment[];
  date: string | null;
}

const COLS = [
  { label: "Cliente", width: 170 },
  { label: "Dirección", width: 210 },
  { label: "Localidad", width: 105 },
  { label: "Teléfono", width: 115 },
  { label: "Factura", width: 90 },
  { label: "monto de la factura", width: 145 },
  { label: "Observaciones", width: 220 },
];

const ROW_H = 22;
const PAD_X = 5;
const FONT_SIZE = 12;

function colX(i: number): number {
  return COLS.slice(0, i).reduce((sum, c) => sum + c.width, 0);
}

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function formatAmount(val: number | null): string {
  if (val == null) return "";
  return `$${val.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const HEADER_BG = "#C9C9C9";

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  bold = false,
  align: CanvasTextAlign = "left",
  bg?: string,
) {
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
  }

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  if (!text) return;

  ctx.font = `${bold ? "bold " : ""}${FONT_SIZE}px Arial, sans-serif`;
  ctx.fillStyle = "#000";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  const tx =
    align === "left" ? x + PAD_X : align === "right" ? x + w - PAD_X : x + w / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 1, y + 1, w - 2, h - 2);
  ctx.clip();
  ctx.fillText(text, tx, y + h / 2 + 1);
  ctx.restore();
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  y: number,
  cells: { text: string; bold?: boolean; align?: CanvasTextAlign }[],
  bg?: string,
) {
  COLS.forEach((col, i) => {
    const { text, bold = false, align = "left" } = cells[i] ?? { text: "" };
    drawCell(ctx, colX(i), y, col.width, ROW_H, text, bold, align, bg);
  });
}

function buildCanvas(shipments: Shipment[], date: string | null): HTMLCanvasElement {
  const regulars = shipments.filter((s) => !s.claim);
  const claims = shipments.filter((s) => s.claim);
  const hasClaimSection = claims.length > 0;

  const totalRows =
    2 + regulars.length + (hasClaimSection ? 1 + 1 + claims.length : 0);

  const totalWidth = COLS.reduce((sum, c) => sum + c.width, 0);
  const totalHeight = totalRows * ROW_H;

  const SCALE = 2;
  const canvas = document.createElement("canvas");
  canvas.width = (totalWidth + 1) * SCALE;
  canvas.height = (totalHeight + 1) * SCALE;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, totalWidth + 1, totalHeight + 1);

  const dateLabel = date ? formatDate(date) : "";

  // Row 0 — top header
  drawRow(ctx, 0, [
    { text: "Pedidos", bold: true },
    { text: "" },
    { text: "" },
    { text: "Entregas", bold: true },
    { text: dateLabel, bold: true },
    { text: "" },
    { text: "" },
  ], HEADER_BG);

  // Row 1 — column headers
  drawRow(
    ctx,
    ROW_H,
    COLS.map((c) => ({ text: c.label, bold: true })),
    HEADER_BG,
  );

  // Regular shipment rows
  regulars.forEach((s, idx) => {
    drawRow(ctx, (2 + idx) * ROW_H, [
      { text: s.clientName },
      { text: s.address || "" },
      { text: s.city || "" },
      { text: s.phone || "" },
      { text: s.invoice || "" },
      { text: formatAmount(s.finalAmount), align: "right" },
      { text: s.details || "" },
    ]);
  });

  if (hasClaimSection) {
    const baseRow = 2 + regulars.length;

    // Empty separator row
    drawRow(ctx, baseRow * ROW_H, COLS.map(() => ({ text: "" })));

    // "Reclamos" header row
    drawRow(ctx, (baseRow + 1) * ROW_H, [
      { text: "Reclamos", bold: true },
      ...Array(6).fill({ text: "" }),
    ], HEADER_BG);

    // Claim rows
    claims.forEach((s, idx) => {
      drawRow(ctx, (baseRow + 2 + idx) * ROW_H, [
        { text: s.clientName },
        { text: s.address || "" },
        { text: s.city || "" },
        { text: s.phone || "" },
        { text: s.invoice || "" },
        { text: formatAmount(s.finalAmount), align: "right" },
        { text: s.details || "" },
      ]);
    });
  }

  return canvas;
}

const DownloadShipmentsButton = ({ shipments, date }: Props) => {
  const handleDownload = () => {
    const canvas = buildCanvas(shipments, date);
    const link = document.createElement("a");
    link.download = `envios-${date ?? "sin-fecha"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={shipments.length === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Descargar
    </Button>
  );
};

export default DownloadShipmentsButton;
