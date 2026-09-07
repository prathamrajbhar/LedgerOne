import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getAnalyticAccountsAction } from "@/app/actions/analytic-account.actions";
import type { Contact, Product, AnalyticAccount } from "@prisma/client";
import { PurchaseCreateClient } from "./purchase-create-client";

async function NewPurchaseOrderContent() {
  const [contactsRes, productsRes, analyticRes] = await Promise.all([
    getContactsAction({ type: "VENDOR", limit: 100 }),
    getProductsAction({ limit: 100 }),
    getAnalyticAccountsAction(),
  ]);

  const rawContacts =
    contactsRes.success && contactsRes.data
      ? ((contactsRes.data as { contacts?: Contact[] }).contacts || [])
      : [];
  const vendors = rawContacts.filter(
    (c) => c.type === "VENDOR" || c.type === "BOTH"
  );
  const products =
    productsRes.success && productsRes.data
      ? ((productsRes.data as { data?: Product[] }).data || [])
      : [];
  const analyticAccounts =
    analyticRes.success && analyticRes.data
      ? (analyticRes.data as AnalyticAccount[])
      : [];

  return (
    <PurchaseCreateClient
      vendors={vendors}
      products={products}
      analyticAccounts={analyticAccounts}
    />
  );
}

export default function NewPurchaseOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Purchase Order Creation Form...
          </p>
        </div>
      }
    >
      <NewPurchaseOrderContent />
    </Suspense>
  );
}
