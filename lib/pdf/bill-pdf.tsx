import React from "react";
import { Document, Page, Text, View, pdf } from "@react-pdf/renderer";
import { VendorBill, Contact, VendorBillLine, Product, CompanySettings } from "@prisma/client";
import { billPdfStyles as styles } from "./bill-pdf.styles";

export interface BillWithRelations extends VendorBill {
  vendor: Contact;
  purchaseOrder?: { id: string; poNumber: string } | null;
  lines: (VendorBillLine & { product?: Product | null })[];
  companySettings?: CompanySettings | null;
}

export const generateBillPDF = async (bill: BillWithRelations): Promise<Buffer> => {
  const currency = bill.companySettings?.baseCurrency || "INR";
  const currencySymbol = currency === "INR" ? "INR " : "$";
  const companyName = bill.companySettings?.companyName || "LedgerOne Enterprise";
  const companyAddress = bill.companySettings?.address || "Financial Accounts Division";

  const totalQty = bill.lines.reduce((acc, l) => acc + Number(l.quantity), 0);
  const subtotal = bill.lines.reduce((sum, line) => {
    return sum + Number(line.quantity) * Number(line.unitPrice);
  }, 0);

  const isPaid = Number(bill.amountDue) <= 0.001;
  const isOverdue = !isPaid && new Date(bill.dueDate) < new Date();

  const BillDoc = (
    <Document title={`VendorBill-${bill.billNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>{companyName}</Text>
            <Text style={styles.brandSub}>{companyAddress}</Text>
          </View>
          <View style={styles.docBadgeContainer}>
            <Text style={styles.docTitle}>VENDOR BILL</Text>
            <Text style={styles.docRef}>{bill.billNumber}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Vendor Information</Text>
            <Text style={styles.entityName}>{bill.vendor.name}</Text>
            <Text style={styles.cardText}>Email: {bill.vendor.email}</Text>
            {bill.vendor.phone && <Text style={styles.cardText}>Phone: {bill.vendor.phone}</Text>}
            {bill.vendor.address && <Text style={styles.cardText}>Address: {bill.vendor.address}</Text>}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Bill Details</Text>
            <View style={styles.keyValRow}>
              <Text style={styles.keyText}>Bill Date:</Text>
              <Text style={styles.valText}>
                {new Date(bill.billDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </Text>
            </View>
            <View style={styles.keyValRow}>
              <Text style={styles.keyText}>Payment Due:</Text>
              <Text style={styles.valText}>
                {new Date(bill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </Text>
            </View>
            {bill.purchaseOrder?.poNumber && (
              <View style={styles.keyValRow}>
                <Text style={styles.keyText}>Source PO:</Text>
                <Text style={styles.valText}>{bill.purchaseOrder.poNumber}</Text>
              </View>
            )}
            <View style={styles.keyValRow}>
              <Text style={styles.keyText}>Status:</Text>
              <Text style={[styles.valText, { color: isPaid ? "#16a34a" : isOverdue ? "#dc2626" : "#d97706" }]}>
                {isPaid ? "PAID IN FULL" : isOverdue ? "OVERDUE" : "PAYMENT PENDING"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>Item & Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Quantity</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price ({currencySymbol.trim()})</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount ({currencySymbol.trim()})</Text>
          </View>

          {bill.lines.map((line, index) => {
            const isAlt = index % 2 === 1;
            const lineQty = Number(line.quantity);
            const linePrice = Number(line.unitPrice);
            const lineTotal = Number(line.lineTotal);

            return (
              <View key={line.id || index} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                <View style={styles.colItem}>
                  <Text style={styles.itemName}>{line.product?.name || "Material / Service"}</Text>
                  {line.product?.sku && <Text style={styles.itemSku}>SKU: {line.product.sku}</Text>}
                </View>
                <Text style={[styles.cellText, styles.colQty]}>{lineQty.toLocaleString("en-IN")}</Text>
                <Text style={[styles.cellText, styles.colPrice]}>
                  {linePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.cellTextBold, styles.colTotal]}>
                  {lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.summarySection}>
          <View
            style={[
              styles.statusCard,
              isPaid ? {} : isOverdue ? styles.statusCardOverdue : styles.statusCardPending,
            ]}
          >
            <Text
              style={[
                styles.statusTitle,
                { color: isPaid ? "#15803d" : isOverdue ? "#b91c1c" : "#b45309" },
              ]}
            >
              {isPaid ? "Full Settlement Completed" : isOverdue ? "Immediate Payment Required" : "Payment Scheduled"}
            </Text>
            <Text style={styles.statusDesc}>
              {isPaid
                ? `All dues of ${currencySymbol}${Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })} have been settled in full.`
                : isOverdue
                ? `This bill has passed the due date (${new Date(bill.dueDate).toLocaleDateString("en-IN")}). Please process the pending balance of ${currencySymbol}${Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}.`
                : `Payment is due on or before ${new Date(bill.dueDate).toLocaleDateString("en-IN")}. Total items received: ${totalQty}.`}
            </Text>
          </View>

          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.keyText}>Subtotal ({bill.lines.length} items):</Text>
              <Text style={styles.cellText}>
                {currencySymbol}{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsBorder]}>
              <Text style={styles.totalsTotalLabel}>Total Payable:</Text>
              <Text style={styles.totalsTotalVal}>
                {currencySymbol}{Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={[styles.keyText, { color: "#16a34a" }]}>Amount Paid:</Text>
              <Text style={[styles.cellTextBold, { color: "#16a34a" }]}>
                {currencySymbol}{Number(bill.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.totalsRow, styles.amountDueRow]}>
              <Text style={[styles.totalsTotalLabel, { color: Number(bill.amountDue) > 0 ? "#dc2626" : "#16a34a" }]}>
                Balance Due:
              </Text>
              <Text style={[styles.totalsTotalVal, { color: Number(bill.amountDue) > 0 ? "#dc2626" : "#16a34a" }]}>
                {currencySymbol}{Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by {companyName} - LedgerOne System
          </Text>
          <Text style={styles.footerText}>
            Document Ref: {bill.id.slice(0, 12).toUpperCase()} - Official Accounts Record
          </Text>
        </View>
      </Page>
    </Document>
  );

  const stream = await pdf(BillDoc).toBuffer();
  const chunks: Buffer[] = [];
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};
