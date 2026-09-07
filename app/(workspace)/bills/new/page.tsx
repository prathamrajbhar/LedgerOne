import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getTaxRatesAction } from "@/app/actions/tax-rate.actions";
import {
  getPurchaseOrdersAction,
} from "@/app/actions/purchase.actions";
import { getAnalyticAccountsAction } from "@/app/actions/analytic-account.actions";
import type { Contact, Product, AnalyticAccount } from "@prisma/client";
import { BillCreateClient } from "./bill-create-client";

async function NewBillContent() {
  const [vendorsRes, productsRes, taxRes, poRes, analyticRes] =
    await Promise.all([
      getContactsAction({ type: "VENDOR", limit: 100 }),
      getProductsAction({ limit: 100 }),
      getTaxRatesAction(),
      getPurchaseOrdersAction(),
      getAnalyticAccountsAction(),
    ]);

  const vendors =
    vendorsRes.success && vendorsRes.data
      ? ((vendorsRes.data as { contacts?: Contact[] }).contacts || [])
      : [];
  const products =
    productsRes.success && productsRes.data
      ? ((productsRes.data as { data?: Product[] }).data || [])
      : [];
  const taxRates =
    taxRes.success && taxRes.data
      ? (taxRes.data as Array<{ id: string; name: string; percentage: number }>)
      : [];
  const purchaseOrders =
    poRes.success && poRes.data
      ? ((poRes.data as {
          data?: Array<{ id: string; poNumber: string; vendorId: string }>;
        }).data || [])
      : [];
  const analyticAccounts =
    analyticRes.success && analyticRes.data
      ? (analyticRes.data as AnalyticAccount[])
      : [];

  return (
    <BillCreateClient
      vendors={vendors}
      products={products}
      taxRates={taxRates}
      purchaseOrders={purchaseOrders}
      analyticAccounts={analyticAccounts}
    />
  );
}

export default function NewVendorBillPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Vendor Bill Creation Form...
          </p>
        </div>
      }
    >
      <NewBillContent />
    </Suspense>
  );
}
