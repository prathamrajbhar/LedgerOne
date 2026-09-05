import React from "react";
import { Document, Page, Text, View, pdf } from "@react-pdf/renderer";
import { CustomerInvoice, Contact, CustomerInvoiceLine, Product, CompanySettings } from "@prisma/client";
import { invoicePdfStyles as styles } from "./invoice-pdf.styles";

export interface InvoiceWithRelations extends CustomerInvoice {
  customer: Contact;
  salesOrder?: { id: string; soNumber: string } | null;
  lines: (CustomerInvoiceLine & {
    product?: Product | null;
    taxRate?: { id: string; name: string; percentage: any } | null;
    analyticAccount?: { id: string; name: string } | null;
  })[];
  companySettings?: CompanySettings | null;
  payments?: any[];
}

/**
 * Converts numeric INR amount into capitalized English words
 */
function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n: number): string => {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str;
  };

  let intPart = Math.floor(num);
  const crore = Math.floor(intPart / 10000000);
  intPart %= 10000000;
  const lakh = Math.floor(intPart / 100000);
  intPart %= 100000;
  const thousand = Math.floor(intPart / 1000);
  intPart %= 1000;
  const hundred = intPart;

  let res = "";
  if (crore > 0) res += inWords(crore) + "Crore ";
  if (lakh > 0) res += inWords(lakh) + "Lakh ";
  if (thousand > 0) res += inWords(thousand) + "Thousand ";
  if (hundred > 0) res += inWords(hundred);

  return (res.trim() + " Rupees Only").replace(/\s+/g, " ");
}

export const generateInvoicePDF = async (invoice: InvoiceWithRelations): Promise<Buffer> => {
  const companyName = invoice.companySettings?.companyName || "Maharaja Furniture Solutions Pvt. Ltd.";
  const companyAddress = invoice.companySettings?.address || "Plot 42, Sector 63, Noida, Uttar Pradesh 201301, India";
  const currencySymbol = "Rs. ";

  let subtotal = 0;
  let totalTax = 0;

  invoice.lines.forEach((line) => {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const tax = Number(line.taxAmount || 0);
    subtotal += qty * price;
    totalTax += tax;
  });

  const totalAmount = Number(invoice.total);
  const amountPaid = Number(invoice.amountPaid);
  const amountDue = Number(invoice.amountDue);

  const isPaid = amountDue <= 0.001;
  const isOverdue = !isPaid && new Date(invoice.dueDate) < new Date();

  // Status colors & label
  const statusLabel = isPaid ? "PAID IN FULL" : isOverdue ? "OVERDUE" : "PAYMENT PENDING";
  const statusBg = isPaid ? "#dcfce7" : isOverdue ? "#fee2e2" : "#fef3c7";
  const statusBorder = isPaid ? "#86efac" : isOverdue ? "#fca5a5" : "#fde047";
  const statusColor = isPaid ? "#15803d" : isOverdue ? "#b91c1c" : "#b45309";

  const InvoiceDocument = (
    <Document title={`TaxInvoice-${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* ================================================================= */}
        {/* 1. HEADER BAND                                                   */}
        {/* ================================================================= */}
        <View style={styles.headerBand}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>{companyName}</Text>
            <Text style={styles.brandTagline}>Premier Handcrafted Teak & Commercial Furniture</Text>
            <Text style={styles.brandAddress}>{companyAddress}</Text>
            <Text style={styles.brandGst}>GSTIN: 07AABCM4512Q1ZX | State Code: 07 (Delhi NCR)</Text>
            <Text style={styles.brandAddress}>Email: billing@maharajafurniture.in | Phone: +91 120 4567 890</Text>
          </View>

          <View style={styles.docBadgeContainer}>
            <Text style={styles.docTitle}>TAX INVOICE</Text>
            <Text style={styles.docRef}>#{invoice.invoiceNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusBorder }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 2. METADATA CARDS (Customer Bill To vs Invoice Details)           */}
        {/* ================================================================= */}
        <View style={styles.metaGrid}>
          {/* Bill To */}
          <View style={styles.infoCardLeft}>
            <Text style={styles.cardHeading}>Billed To / Customer Details</Text>
            <Text style={styles.entityName}>{invoice.customer.name}</Text>
            <Text style={styles.cardText}>Email: {invoice.customer.email}</Text>
            {invoice.customer.phone && <Text style={styles.cardText}>Phone: {invoice.customer.phone}</Text>}
            {invoice.customer.address ? (
              <Text style={styles.cardText}>Address: {invoice.customer.address}</Text>
            ) : (
              <Text style={styles.cardText}>Address: Delivery as per registered commercial profile</Text>
            )}
          </View>

          {/* Invoice Meta */}
          <View style={styles.infoCardRight}>
            <Text style={styles.cardHeading}>Invoice & Order Details</Text>
            <View style={styles.keyValRow}>
              <Text style={styles.keyText}>Invoice Date:</Text>
              <Text style={styles.valText}>
                {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </Text>
            </View>
            <View style={styles.keyValRow}>
              <Text style={styles.keyText}>Payment Due:</Text>
              <Text style={styles.valText}>
                {new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </Text>
            </View>
            <View style={styles.keyValRow}>
              <Text style={styles.keyText}>Payment Terms:</Text>
              <Text style={styles.valText}>Net 15 Days</Text>
            </View>
            {invoice.salesOrder?.soNumber && (
              <View style={styles.keyValRow}>
                <Text style={styles.keyText}>Source Sales Order:</Text>
                <Text style={styles.valText}>{invoice.salesOrder.soNumber}</Text>
              </View>
            )}
            {invoice.invoiceReference && (
              <View style={styles.keyValRow}>
                <Text style={styles.keyText}>Client Ref / P.O.:</Text>
                <Text style={styles.valText}>{invoice.invoiceReference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ================================================================= */}
        {/* 3. ITEMIZED PRODUCTS TABLE                                       */}
        {/* ================================================================= */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colSl]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>Item Description & Specs</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Rate ({currencySymbol.trim()})</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>Tax ({currencySymbol.trim()})</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount ({currencySymbol.trim()})</Text>
          </View>

          {invoice.lines.map((line, index) => {
            const isAlt = index % 2 === 1;
            const lineQty = Number(line.quantity);
            const linePrice = Number(line.unitPrice);
            const lineTax = Number(line.taxAmount || 0);
            const lineTotal = Number(line.lineTotal);

            const productName = line.product?.name || "Furnishing / Service Item";
            const productSku = line.product?.sku;
            const material = line.product?.material;
            const dimensions = line.product?.dimensions;

            return (
              <View key={line.id || index} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                <Text style={[styles.cellText, styles.colSl]}>{index + 1}</Text>
                <View style={styles.colItem}>
                  <Text style={styles.itemName}>{productName}</Text>
                  <Text style={styles.itemSub}>
                    {productSku ? `SKU: ${productSku}` : ""}
                    {material ? ` • ${material}` : ""}
                    {dimensions ? ` • ${dimensions}` : ""}
                  </Text>
                </View>
                <Text style={[styles.cellText, styles.colQty]}>{lineQty.toLocaleString("en-IN")}</Text>
                <Text style={[styles.cellText, styles.colPrice]}>
                  {linePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.cellText, styles.colTax]}>
                  {lineTax > 0 ? lineTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </Text>
                <Text style={[styles.cellTextBold, styles.colTotal]}>
                  {lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ================================================================= */}
        {/* 4. SUMMARY & PAYMENT SECTION                                     */}
        {/* ================================================================= */}
        <View style={styles.summarySection}>
          {/* Left: Payment Info & Terms */}
          <View style={styles.paymentCard}>
            <Text style={styles.paymentHeading}>Payment Instructions & Banking</Text>
            <Text style={styles.paymentDesc}>
              Beneficiary Name: {companyName}{"\n"}
              Bank: ICICI Bank Ltd. | Branch: Sector 63, Noida{"\n"}
              Current A/C No: 1010-0982-4412-00 | IFSC: ICIC0001010{"\n"}
              UPI ID: billing@maharajafurniture | Online Gateway: Razorpay
            </Text>

            <Text style={styles.paymentHeading}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              1. Goods once sold are backed by Maharaja 1-year manufacturing defect warranty.{"\n"}
              2. Overdue payments will incur statutory delayed interest @18% per annum.{"\n"}
              3. Disputes are subject to the exclusive jurisdiction of courts in Gautam Buddha Nagar (UP).
            </Text>
          </View>

          {/* Right: Totals Card */}
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.keyText}>Taxable Subtotal:</Text>
              <Text style={styles.cellText}>
                {currencySymbol}{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {totalTax > 0 && (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.keyText}>Central GST (CGST 9%):</Text>
                  <Text style={styles.cellText}>
                    {currencySymbol}{(totalTax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.keyText}>State GST (SGST 9%):</Text>
                  <Text style={styles.cellText}>
                    {currencySymbol}{(totalTax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </>
            )}

            <View style={[styles.totalsRow, styles.totalsBorder]}>
              <Text style={styles.totalsTotalLabel}>Total Invoice Amount:</Text>
              <Text style={styles.totalsTotalVal}>
                {currencySymbol}{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={[styles.keyText, { color: "#16a34a" }]}>Amount Paid / Received:</Text>
              <Text style={[styles.cellTextBold, { color: "#16a34a" }]}>
                {currencySymbol}{amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={[styles.totalsRow, styles.amountDueRow]}>
              <Text style={[styles.totalsTotalLabel, { color: amountDue > 0 ? "#b91c1c" : "#15803d" }]}>
                Net Balance Due:
              </Text>
              <Text style={[styles.totalsTotalVal, { color: amountDue > 0 ? "#b91c1c" : "#15803d" }]}>
                {currencySymbol}{amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Amount in words */}
            <View style={styles.wordsBlock}>
              <Text style={styles.wordsLabel}>Amount in Words:</Text>
              <Text style={styles.wordsText}>{numberToIndianWords(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 5. SIGNATORY SECTION                                             */}
        {/* ================================================================= */}
        <View style={styles.signatorySection}>
          <View style={styles.signatoryLeft}>
            <Text style={{ fontSize: 7, color: "#64748b", lineHeight: 1.3 }}>
              Declaration: We declare that this invoice shows the actual price of the goods and services described
              and that all particulars are true and correct.
            </Text>
          </View>

          <View style={styles.signatoryRight}>
            <Text style={styles.signatoryFor}>For {companyName}</Text>
            <View style={styles.signatoryLine}>
              <Text style={styles.signatoryTitle}>Authorized Signatory</Text>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 6. FOOTER                                                        */}
        {/* ================================================================= */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated via LedgerOne ERP System | {new Date().toLocaleDateString("en-IN")}
          </Text>
          <Text style={styles.footerText}>
            Official Computer-Generated Tax Invoice • Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  );

  const stream = await pdf(InvoiceDocument).toBuffer();
  const chunks: Buffer[] = [];
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};
