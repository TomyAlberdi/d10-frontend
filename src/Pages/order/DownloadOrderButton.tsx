import { Button } from "@/components/ui/button";
import type { Order, OrderProduct } from "@/interfaces/OrderInterfaces";
import { Download } from "lucide-react";
import { formatShortDate } from "./orderFormat";

interface Props {
  order: Order;
}

const CODE_WIDTH = 90;
const QUANTITY_WIDTH = 90;
/** The product column grows with the longest name, within these bounds. */
const PRODUCT_MIN_WIDTH = 215;
const PRODUCT_MAX_WIDTH = 460;

const ROW_H = 22;
const PAD_X = 6;
const FONT_SIZE = 12;

const HEADER_BG = "#FFFFFF";
const CODE_COLOR = "#C55A11";
const PRODUCT_COLOR = "#0070C0";

function fontFor(bold: boolean): string {
  return `${bold ? "bold " : ""}${FONT_SIZE}px Arial, sans-serif`;
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  text: string,
  {
    bold = false,
    align = "left" as CanvasTextAlign,
    color = "#000",
    bg,
  }: {
    bold?: boolean;
    align?: CanvasTextAlign;
    color?: string;
    bg?: string;
  } = {},
) {
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, ROW_H);
  }

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, ROW_H - 1);

  if (!text) return;

  ctx.font = fontFor(bold);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  const tx =
    align === "left" ? x + PAD_X : align === "right" ? x + w - PAD_X : x + w / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 1, y + 1, w - 2, ROW_H - 2);
  ctx.clip();
  ctx.fillText(text, tx, y + ROW_H / 2 + 1);
  ctx.restore();
}

/** Width the product column needs so the longest name fits without clipping. */
function measureProductWidth(products: OrderProduct[]): number {
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return PRODUCT_MIN_WIDTH;
  probe.font = fontFor(false);
  const widest = products.reduce(
    (max, product) => Math.max(max, probe.measureText(product.productName).width),
    0,
  );
  return Math.min(
    PRODUCT_MAX_WIDTH,
    Math.max(PRODUCT_MIN_WIDTH, Math.ceil(widest) + PAD_X * 2),
  );
}

function buildCanvas(order: Order): HTMLCanvasElement {
  const products = order.products;
  const productWidth = measureProductWidth(products);
  const widths = [CODE_WIDTH, productWidth, QUANTITY_WIDTH];
  const x = [0, CODE_WIDTH, CODE_WIDTH + productWidth];

  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  // Date row + header row + one row per product
  const totalHeight = (2 + products.length) * ROW_H;

  const SCALE = 2;
  const canvas = document.createElement("canvas");
  canvas.width = (totalWidth + 1) * SCALE;
  canvas.height = (totalHeight + 1) * SCALE;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, totalWidth + 1, totalHeight + 1);

  // Row 0 — only the quantity column is boxed, carrying the order date
  drawCell(ctx, x[2], 0, widths[2], formatShortDate(order.date), {
    bold: true,
    align: "center",
    bg: HEADER_BG,
  });

  // Row 1 — column headers
  ["CODIGO", "PRODUCTO", "CANTIDAD"].forEach((label, i) => {
    drawCell(ctx, x[i], ROW_H, widths[i], label, {
      bold: true,
      align: "center",
      bg: HEADER_BG,
    });
  });

  // One row per ordered product
  products.forEach((product, idx) => {
    const y = (2 + idx) * ROW_H;
    drawCell(ctx, x[0], y, widths[0], product.productCode ?? "", {
      align: "center",
      color: CODE_COLOR,
    });
    drawCell(ctx, x[1], y, widths[1], product.productName, {
      color: PRODUCT_COLOR,
    });
    drawCell(ctx, x[2], y, widths[2], String(product.saleUnitQuantity), {
      align: "center",
      color: PRODUCT_COLOR,
    });
  });

  return canvas;
}

/** Downloads the order as the printable PNG list used to buy the products. */
const DownloadOrderButton = ({ order }: Props) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = buildCanvas(order);
    const link = document.createElement("a");
    link.download = `pedido-${order.date ?? "sin-fecha"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      title="Descargar la lista del pedido"
      disabled={order.products.length === 0}
      onClick={handleDownload}
    >
      <Download className="w-4 h-4" />
    </Button>
  );
};

export default DownloadOrderButton;
