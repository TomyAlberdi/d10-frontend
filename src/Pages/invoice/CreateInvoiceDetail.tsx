import type { CartProduct } from "@/interfaces/CartInterfaces";
import type { Invoice } from "@/interfaces/InvoiceInterfaces";
import jsPDF from "jspdf";

const formatDate = (isoDate: string) => {
  if (!isoDate) return "";

  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const generatePDF = (invoice: Invoice | null) => {
  const doc = new jsPDF();
  // Title
  doc.setFontSize(25);
  doc.setFont("helvetica", "bold");
  doc.text("Diseño 10 Olavarría", 10, 20);
  // Date and Company Info
  doc.setFontSize(20);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice?.date ?? ""), 10, 30);
  // Invoice Number
  doc.setFont("helvetica", "bold");
  doc.text(`Presupuesto: #${invoice?.invoiceNumber ?? invoice?.id}`, 10, 40);
  // Table Headers
  const headers = [
    "Cantidad Solicitada",
    "Unidades",
    "Nombre",
    "Precio Unitario",
    "Descuento",
    "Subtotal",
  ];
  // Draw table
  let startY = 50;
  const columnWidths = [30, 30, 60, 30, 30];
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
      `${product.measureUnitQuantity} ${product.measureType}`,
      `${product.saleUnitQuantity} ${product.saleUnitType}`,
      product.name,
      `$ ${product.priceByMeasureUnit} / ${product.measureType}`,
      `${!product.individualDiscount ? "N/A" : `$ ${product.individualDiscount}`}`,
      `$ ${product.subtotal}`,
    ];
    rowData.forEach((text, index) => {
      const xPos = 10 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      const splitText = doc.splitTextToSize(text, columnWidths[index] - 2);
      doc.text(splitText, xPos, cellY);
      rowHeight = Math.max(rowHeight, splitText.length * 4);
    });
    startY += rowHeight + 4;
  });

  // Final Amounts
  startY += 10;
  doc.setFontSize(10);
  const rightAlignX = 125;
  doc.text(
    "Precios sujetos a modificación sin previo aviso.",
    rightAlignX,
    startY,
  );
  startY += 10;
  if (invoice?.discount && invoice?.discount > 0) {
    doc.text(`Descuento: $ ${invoice?.discount}`, rightAlignX, startY);
    startY += 5;
  }
  doc.text(`Importe Total: $ ${invoice?.total}`, rightAlignX, startY);
  doc.text(`Per./Ret. Ingresos Brutos: $ 0.00`, rightAlignX, startY + 5);
  doc.text(`Importe Final: $ ${invoice?.total}`, rightAlignX, startY + 10);
  return doc;
};
