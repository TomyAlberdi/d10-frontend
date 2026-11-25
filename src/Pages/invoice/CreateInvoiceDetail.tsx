import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import { invoiceDocumentLabel } from "@/lib/invoice";
import { roundMeasure } from "@/lib/measure";
import jsPDF from "jspdf";

const formatDate = (isoDate: string) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return "0.00";
  return Number(value).toFixed(2);
};

/**
 * For a product sold and measured by the unit, the units times its
 * dimensions: 15 units of "25kg" is "375kg". Null when the dimensions are not
 * a single amount with an optional unit ("20x30cm").
 */
const dimensionsTotal = (product: CartProduct): string | null => {
  if (product.saleUnitType !== "UNIDAD" || product.measureType !== "UNIDAD") {
    return null;
  }
  const match = product.dimensions
    ?.trim()
    .match(/^(\d+(?:[.,]\d+)?)(\s*)([\p{L}²³.]*)$/u);
  if (!match) return null;
  const [, amount, space, unit] = match;
  const total = roundMeasure(
    Number(amount.replace(",", ".")) * product.saleUnitQuantity,
  );
  const formatted = amount.includes(",")
    ? String(total).replace(".", ",")
    : String(total);
  return `${formatted}${space}${unit}`;
};

/**
 * What is left of the prices after the line's own discount: 0.9 for 10% off.
 * Taken from the subtotal, which already has the discount applied, so the
 * prices shown add up to it.
 */
const discountFactor = (product: CartProduct): number => {
  const rawSubtotal = product.saleUnitQuantity * product.priceBySaleUnit;
  if (!(product.individualDiscount > 0) || !(rawSubtotal > 0)) return 1;
  return Math.min(1, Math.max(0, product.subtotal / rawSubtotal));
};

export const generatePDF = (invoice: Invoice | null) => {
  const doc = new jsPDF();
  // Title
  doc.setFontSize(25);
  doc.setFont("helvetica", "bold");
  doc.text("Diseño 10 Olavarría", 10, 20);
  // Date and Company Info
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice?.date ?? ""), 200, 20, { align: "right" });
  // Invoice Number
  doc.setFont("helvetica", "bold");
  doc.text(
    `${invoiceDocumentLabel(invoice?.status)}: #${invoice?.invoiceNumber ?? invoice?.id}`,
    10,
    40,
  );
  // Table Headers
  const headers = [
    "Unidades",
    "Cantidad",
    "Medidas",
    "Nombre",
    "Precio",
    "Precio Unitario",
    "Subtotal",
  ];
  // Draw table
  let startY = 50;
  const columnWidths = [25, 25, 25, 50, 25, 25, 25];
  doc.setFontSize(8);
  headers.forEach((header, index) => {
    doc.text(
      header,
      10 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
      startY,
    );
  });
  doc.setFont("helvetica", "normal");
  startY += 10;
  invoice?.products.forEach((product: CartProduct) => {
    let rowHeight = 0;
    const cellY = startY;
    const factor = discountFactor(product);
    const rowData = [
      `${product.saleUnitQuantity} ${product.saleUnitType}`,
      dimensionsTotal(product) ??
        `${formatCurrency(product.measureUnitQuantity)} ${product.measureType}`,
      product.dimensions ?? "N/A",
      product.name,
      `$ ${formatCurrency(product.priceByMeasureUnit * factor)} / ${product.measureType}`,
      `$ ${formatCurrency(product.priceBySaleUnit * factor)} / ${product.saleUnitType}`,
      `$ ${formatCurrency(product.subtotal)}`,
    ];
    rowData.forEach((text, index) => {
      const xPos = 10 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      const splitText = doc.splitTextToSize(text, columnWidths[index] - 2);
      doc.text(splitText, xPos, cellY);
      rowHeight = Math.max(rowHeight, splitText.length * 4);
    });
    startY += rowHeight + 4;
  });

  // Final Amounts at bottom of page
  let finalY = 270;
  doc.setFontSize(10);
  const rightAlignX = 125;
  doc.text(
    "Precios sujetos a modificación sin previo aviso.",
    rightAlignX,
    finalY,
  );
  finalY += 10;
  if (invoice?.discount && invoice?.discount > 0) {
    doc.text(`Descuento: $ ${formatCurrency(invoice?.discount)}`, rightAlignX, finalY);
    finalY += 5;
  }
  doc.text(`Importe Total: $ ${formatCurrency(invoice?.total)}`, rightAlignX, finalY);
  doc.text(`Per./Ret. Ingresos Brutos: $ 0.00`, rightAlignX, finalY + 5);
  doc.text(`Importe Final: $ ${formatCurrency(invoice?.total)}`, rightAlignX, finalY + 10);
  return doc;
};
