import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
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
  doc.text(`Presupuesto: #${invoice?.invoiceNumber ?? invoice?.id}`, 10, 40);
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
    const rowData = [
      `${product.saleUnitQuantity} ${product.saleUnitType}`,
      `${formatCurrency(product.measureUnitQuantity)} ${product.measureType}`,
      product.dimensions ?? "N/A",
      product.name,
      `$ ${formatCurrency(product.priceByMeasureUnit)} / ${product.measureType}`,
      `$ ${formatCurrency(product.priceBySaleUnit)} / ${product.saleUnitType}`,
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
