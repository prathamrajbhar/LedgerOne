import { StyleSheet } from "@react-pdf/renderer";

export const billPdfStyles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1e293b", backgroundColor: "#ffffff" },
  headerBand: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingBottom: 18, borderBottomWidth: 1.5, borderBottomColor: "#e2e8f0", marginBottom: 20,
  },
  brandContainer: { flexDirection: "column", gap: 3 },
  brandName: { fontSize: 20, fontWeight: "bold", color: "#0f172a", letterSpacing: 0.5 },
  brandSub: { fontSize: 8.5, color: "#64748b" },
  docBadgeContainer: { alignItems: "flex-end" },
  docTitle: { fontSize: 22, fontWeight: "bold", color: "#0d9488", letterSpacing: 0.8 },
  docRef: { fontSize: 10, fontWeight: "bold", color: "#334155", marginTop: 3 },
  metaGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, gap: 16 },
  infoCard: {
    flex: 1, backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0",
  },
  cardHeading: {
    fontSize: 8, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 6, paddingBottom: 3, borderBottomWidth: 0.8, borderBottomColor: "#cbd5e1",
  },
  entityName: { fontSize: 11, fontWeight: "bold", color: "#0f172a", marginBottom: 3 },
  cardText: { fontSize: 8.5, color: "#475569", lineHeight: 1.35 },
  keyValRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  keyText: { fontSize: 8.5, color: "#64748b" },
  valText: { fontSize: 8.5, fontWeight: "bold", color: "#0f172a" },
  table: {
    width: "100%", marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 5, overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 7, paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 8, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9", alignItems: "center",
  },
  tableRowAlt: { backgroundColor: "#f8fafc" },
  colItem: { width: "42%" },
  colQty: { width: "16%", textAlign: "center" },
  colPrice: { width: "21%", textAlign: "right" },
  colTotal: { width: "21%", textAlign: "right" },
  itemName: { fontSize: 9, fontWeight: "bold", color: "#0f172a" },
  itemSku: { fontSize: 7.5, color: "#64748b", marginTop: 1.5 },
  cellText: { fontSize: 8.5, color: "#334155" },
  cellTextBold: { fontSize: 9, fontWeight: "bold", color: "#0f172a" },
  summarySection: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16,
  },
  statusCard: {
    width: "48%", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", borderWidth: 1, borderRadius: 6, padding: 10,
  },
  statusCardPending: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  statusCardOverdue: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  statusTitle: {
    fontSize: 8.5, fontWeight: "bold", color: "#15803d", textTransform: "uppercase", marginBottom: 3,
  },
  statusDesc: { fontSize: 8, color: "#475569", lineHeight: 1.3 },
  totalsCard: {
    width: "48%", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, padding: 10,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsBorder: { borderTopWidth: 1.5, borderTopColor: "#0f172a", marginTop: 4, paddingTop: 5 },
  totalsTotalLabel: { fontSize: 10, fontWeight: "bold", color: "#0f172a" },
  totalsTotalVal: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },
  amountDueRow: { backgroundColor: "#f1f5f9", padding: 4, borderRadius: 4, marginTop: 4 },
  footer: {
    position: "absolute", bottom: 24, left: 36, right: 36, paddingTop: 8, borderTopWidth: 1,
    borderTopColor: "#e2e8f0", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontSize: 7.5, color: "#94a3b8" },
});
