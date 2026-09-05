import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { CustomerInvoice, Contact, CustomerInvoiceLine, Product } from "@prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCol: {
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#000",
  },
});

export interface InvoiceWithRelations extends CustomerInvoice {
  customer: Contact;
  lines: (CustomerInvoiceLine & { product?: Product })[];
}

export const generateInvoicePDF = async (invoice: InvoiceWithRelations): Promise<Buffer> => {
  let subtotal = 0;
  let totalTax = 0;

  invoice.lines.forEach((line) => {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const tax = Number(line.taxAmount || 0);
    subtotal += qty * price;
    totalTax += tax;
  });

  const InvoiceDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text>Invoice #: {invoice.invoiceNumber}</Text>
          <Text>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</Text>
          <Text>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Bill To:</Text>
          <Text>{invoice.customer.name}</Text>
          <Text>{invoice.customer.email}</Text>
          {invoice.customer.phone && <Text>{invoice.customer.phone}</Text>}
          {invoice.customer.address && <Text>{invoice.customer.address}</Text>}
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "40%" }]}>
              <Text>Product</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Quantity</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Unit Price</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Tax</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Total</Text>
            </View>
          </View>

          {invoice.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "40%" }]}>
                <Text>{line.product?.name || "Product"}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.quantity.toString()}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.unitPrice.toString()}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.taxAmount ? line.taxAmount.toString() : "0.00"}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.lineTotal.toString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Subtotal: {subtotal.toFixed(2)}</Text>
          <Text>Tax: {totalTax.toFixed(2)}</Text>
          <Text style={{ fontWeight: "bold", fontSize: 12 }}>
            Total: {Number(invoice.total).toFixed(2)}
          </Text>
          <Text>Amount Paid: {Number(invoice.amountPaid).toFixed(2)}</Text>
          <Text style={{ fontWeight: "bold" }}>
            Amount Due: {Number(invoice.amountDue).toFixed(2)}
          </Text>
        </View>
      </Page>
    </Document>
  );

  const stream = await pdf(InvoiceDocument).toBuffer();
  return stream as unknown as Buffer;
};
