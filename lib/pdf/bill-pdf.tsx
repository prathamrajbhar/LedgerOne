import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { VendorBill, Contact, VendorBillLine, Product } from "@prisma/client";

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

export interface BillWithRelations extends VendorBill {
  vendor: Contact;
  lines: (VendorBillLine & { product?: Product })[];
}

export const generateBillPDF = async (bill: BillWithRelations): Promise<Buffer> => {
  let subtotal = 0;

  bill.lines.forEach((line) => {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    subtotal += qty * price;
  });

  const BillDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>VENDOR BILL</Text>
          <Text>Bill #: {bill.billNumber}</Text>
          <Text>Date: {new Date(bill.billDate).toLocaleDateString()}</Text>
          <Text>Due Date: {new Date(bill.dueDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Vendor:</Text>
          <Text>{bill.vendor.name}</Text>
          <Text>{bill.vendor.email}</Text>
          {bill.vendor.phone && <Text>{bill.vendor.phone}</Text>}
          {bill.vendor.address && <Text>{bill.vendor.address}</Text>}
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "40%" }]}>
              <Text>Product</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text>Quantity</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text>Unit Price</Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text>Total</Text>
            </View>
          </View>

          {bill.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "40%" }]}>
                <Text>{line.product?.name || "Product"}</Text>
              </View>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text>{line.quantity.toString()}</Text>
              </View>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text>{line.unitPrice.toString()}</Text>
              </View>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text>{line.lineTotal.toString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Subtotal: {subtotal.toFixed(2)}</Text>
          <Text style={{ fontWeight: "bold", fontSize: 12 }}>
            Total: {Number(bill.total).toFixed(2)}
          </Text>
          <Text>Amount Paid: {Number(bill.amountPaid).toFixed(2)}</Text>
          <Text style={{ fontWeight: "bold" }}>
            Amount Due: {Number(bill.amountDue).toFixed(2)}
          </Text>
        </View>
      </Page>
    </Document>
  );

  const stream = await pdf(BillDocument).toBuffer();
  return stream as unknown as Buffer;
};
