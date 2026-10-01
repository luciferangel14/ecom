import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const SHOP_NAME = "Aadheera Boutique";

// Default PDF fonts can't draw the ₹ symbol, so the PDF uses "Rs."
const money = (n) => `Rs. ${Number(n).toFixed(2)}`;

export function buildInvoicePdf({ invoiceNo, customerName, customerPhone, items, subtotal, discount, total, date }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.text(SHOP_NAME, 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Invoice", 14, 29);

  doc.setTextColor(0);
  doc.setFontSize(11);
  const when = new Date(date);
  const dateStr = when.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const timeStr = when.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - 14, 22, { align: "right" });
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 29, { align: "right" });
  doc.text(`Time: ${timeStr}`, pageWidth - 14, 36, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Billed to", 14, 44);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(customerName, 14, 51);
  doc.setFontSize(10);
  doc.text(customerPhone, 14, 57);

  autoTable(doc, {
    startY: 66,
    head: [["Item", "Price", "Qty", "Amount"]],
    body: items.map((i) => [i.name, money(i.price), String(i.qty), money(i.line_total)]),
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  let y = doc.lastAutoTable.finalY + 10;
  const right = pageWidth - 14;
  doc.setFontSize(10);
  doc.text("Subtotal", right - 50, y);
  doc.text(money(subtotal), right, y, { align: "right" });
  if (discount > 0) {
    y += 7;
    doc.text("Discount", right - 50, y);
    doc.text(`- ${money(discount)}`, right, y, { align: "right" });
  }
  y += 9;
  doc.setFontSize(13);
  doc.text("Total", right - 50, y);
  doc.text(money(total), right, y, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Thank you for shopping with ${SHOP_NAME}.`, 14, 285);

  return doc;
}
