import * as React from "react";
import { toast } from "sonner";
import type { Contact } from "@prisma/client";
import type { VendorBillWithRelations } from "./bills-types";
import {
  getVendorBillsAction,
  confirmBillAction,
  cancelBillAction,
} from "@/app/actions/purchase.actions";
import {
  sendBillReminderAction,
  dispatchBatchDueBillAlertsAction,
} from "@/app/actions/bill-reminder.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import {
  calculateBillSummaryMetrics,
  getVendorBillDisplayStatus,
  filterVendorBills,
  downloadVendorBillPDF,
} from "./lib/bills-helpers";

export function useVendorBills() {
  const [bills, setBills] = React.useState<VendorBillWithRelations[]>([]);
  const [vendors, setVendors] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [vendorFilter, setVendorFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = React.useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Action status trackers
  const [confirmingBillId, setConfirmingBillId] = React.useState<string | null>(null);
  const [cancellingBillId, setCancellingBillId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = React.useState<string | null>(null);
  const [runningBatchAlerts, setRunningBatchAlerts] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [billsRes, vendorsRes] = await Promise.all([
        getVendorBillsAction(),
        getContactsAction({ type: "VENDOR", limit: 100 }),
      ]);

      if (billsRes.success && billsRes.data) {
        setBills(billsRes.data as unknown as VendorBillWithRelations[]);
      } else {
        toast.error(billsRes.error || "Failed to load vendor bills");
      }

      if (vendorsRes.success && vendorsRes.data) {
        const vData = vendorsRes.data as { contacts?: Contact[] };
        setVendors(vData.contacts || []);
      }
    } catch {
      toast.error("Failed to load vendor bills workspace data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmBill = async (billId: string) => {
    setConfirmingBillId(billId);
    try {
      const result = await confirmBillAction(billId);
      if (result.success) {
        toast.success("Vendor bill posted! Journal Entry created.");
        await fetchData();
      } else {
        toast.error(result.error || "Failed to confirm vendor bill");
      }
    } catch {
      toast.error("Error occurred while confirming vendor bill");
    } finally {
      setConfirmingBillId(null);
    }
  };

  const handleCancelBill = async (billId: string) => {
    if (!confirm("Are you sure you want to cancel this vendor bill?")) return;
    setCancellingBillId(billId);
    try {
      const result = await cancelBillAction(billId);
      if (result.success) {
        toast.success("Vendor bill has been marked as Cancelled");
        await fetchData();
      } else {
        toast.error(result.error || "Failed to cancel vendor bill");
      }
    } catch {
      toast.error("Error occurred while cancelling bill");
    } finally {
      setCancellingBillId(null);
    }
  };

  const handleDownloadPDF = async (bill: VendorBillWithRelations) => {
    setDownloadingId(bill.id);
    try {
      await downloadVendorBillPDF(bill);
    } catch {
      toast.error("Error downloading PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendReminder = async (billId: string) => {
    setSendingReminderId(billId);
    try {
      const res = await sendBillReminderAction(billId);
      if (res.success) {
        toast.success(res.message || "Reminder email sent successfully");
        await fetchData();
      } else {
        toast.error(res.error || "Failed to send reminder email");
      }
    } catch {
      toast.error("Error dispatching payment reminder email");
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleRunBatchAlerts = async () => {
    setRunningBatchAlerts(true);
    try {
      const res = await dispatchBatchDueBillAlertsAction();
      if (res.success) {
        toast.success(res.message);
        await fetchData();
      } else {
        toast.error(res.error || "Batch reminder execution failed");
      }
    } catch {
      toast.error("Error running batch reminder alerts");
    } finally {
      setRunningBatchAlerts(false);
    }
  };

  const summaryMetrics = React.useMemo(
    () => calculateBillSummaryMetrics(bills),
    [bills]
  );

  const filteredBills = React.useMemo(
    () =>
      filterVendorBills(
        bills,
        search,
        vendorFilter,
        statusFilter,
        paymentStatusFilter,
        dateRangeFilter
      ),
    [bills, search, vendorFilter, statusFilter, paymentStatusFilter, dateRangeFilter]
  );

  return {
    bills,
    vendors,
    loading,
    search,
    setSearch,
    vendorFilter,
    setVendorFilter,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    confirmingBillId,
    cancellingBillId,
    downloadingId,
    sendingReminderId,
    runningBatchAlerts,
    handleConfirmBill,
    handleCancelBill,
    handleDownloadPDF,
    handleSendReminder,
    handleRunBatchAlerts,
    summaryMetrics,
    getDisplayStatus: getVendorBillDisplayStatus,
    filteredBills,
  };
}
