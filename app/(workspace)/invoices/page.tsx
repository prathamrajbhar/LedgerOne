import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { InvoicesClient } from "./invoices-client";
import {
  getInvoicesAction,
  getSalesOrdersAction,
} from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getTaxRatesAction } from "@/app/actions/tax-rate.actions";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import type { Contact, Product } from "@prisma/client";

interface PageProps {
  searchParams: {
    search?: string;
    customer?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  };
}

async function InvoicesPageContent({ searchParams }: PageProps) {
  // Fetch all data in parallel
  const [invoicesRes, customersRes, productsRes, taxRes, soRes] =
    await Promise.all([
      getInvoicesAction({ limit: 1000 }),
      getContactsAction({ type: "CUSTOMER", limit: 1000 }),
      getProductsAction({ limit: 1000 }),
      getTaxRatesAction(),
      getSalesOrdersAction({ limit: 1000 }),
    ]);

  // Extract data
  const allInvoices =
    invoicesRes.success && invoicesRes.data ? invoicesRes.data.data : [];
  const customers =
    customersRes.success && customersRes.data
      ? ((customersRes.data as { contacts?: Contact[] }).contacts || [])
      : [];
  const products =
    productsRes.success && productsRes.data
      ? ((productsRes.data as { data?: Product[] }).data || [])
      : [];
  const taxRates =
    taxRes.success && taxRes.data
      ? (taxRes.data as Array<{ id: string; name: string; percentage: number }>)
      : [];
  const salesOrders =
    soRes.success && soRes.data
      ? ((soRes.data as {
          data?: Array<{ id: string; soNumber: string; customerId: string }>;
        }).data || [])
      : [];

  // Apply server-side filtering based on URL params
  const filteredInvoices = allInvoices.filter((inv: any) => {
    // Search filter
    if (searchParams.search) {
      const q = searchParams.search.toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer?.name.toLowerCase().includes(q) ||
        (inv.salesOrder?.soNumber &&
          inv.salesOrder.soNumber.toLowerCase().includes(q));

      if (!matchesSearch) return false;
    }

    // Customer filter
    if (searchParams.customer && searchParams.customer !== "ALL") {
      if (inv.customerId !== searchParams.customer) return false;
    }

    // Status filter
    if (searchParams.status && searchParams.status !== "ALL") {
      const status = searchParams.status;

      if (status === "DRAFT" && inv.status !== DocumentStatus.DRAFT)
        return false;
      if (status === "CONFIRMED" && inv.status !== DocumentStatus.CONFIRMED)
        return false;
      if (status === "CANCELLED" && inv.status !== DocumentStatus.CANCELLED)
        return false;

      // Handle computed statuses (OVERDUE, PAID, PARTIAL)
      if (status === "OVERDUE") {
        const today = new Date();
        const dueDate = new Date(inv.dueDate);
        const isOverdue =
          Number(inv.amountDue) > 0 &&
          dueDate < today &&
          inv.paymentStatus !== PaymentStatus.PAID;
        if (!isOverdue) return false;
      }

      if (status === "PAID" && inv.paymentStatus !== PaymentStatus.PAID)
        return false;
      if (status === "PARTIAL" && inv.paymentStatus !== PaymentStatus.PARTIAL)
        return false;
    }

    // Payment status filter
    if (
      searchParams.paymentStatus &&
      searchParams.paymentStatus !== "ALL"
    ) {
      if (inv.paymentStatus !== searchParams.paymentStatus) return false;
    }

    // Date range filter
    if (searchParams.startDate) {
      const start = new Date(searchParams.startDate);
      const invoiceDate = new Date(inv.invoiceDate);
      if (invoiceDate < start) return false;
    }

    if (searchParams.endDate) {
      const end = new Date(searchParams.endDate);
      const invoiceDate = new Date(inv.invoiceDate);
      if (invoiceDate > end) return false;
    }

    return true;
  });

  return (
    <InvoicesClient
      invoices={filteredInvoices}
      customers={customers}
      products={products}
      taxRates={taxRates}
      salesOrders={salesOrders}
    />
  );
}

export default function InvoicesPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Customer Invoices & Ledger Data...
          </p>
        </div>
      }
    >
      <InvoicesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
