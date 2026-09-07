import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import type { Contact, Product } from "@prisma/client";
import { SalesCreateClient } from "./sales-create-client";

async function NewSalesOrderContent() {
  const [contactsRes, productsRes] = await Promise.all([
    getContactsAction({ type: "CUSTOMER", limit: 100 }),
    getProductsAction({ limit: 100 }),
  ]);

  const rawContacts =
    contactsRes.success && contactsRes.data
      ? ((contactsRes.data as { contacts?: Contact[] }).contacts || [])
      : [];
  const customers = rawContacts.filter(
    (c) => c.type === "CUSTOMER" || c.type === "BOTH"
  );
  const products =
    productsRes.success && productsRes.data
      ? ((productsRes.data as { data?: Product[] }).data || [])
      : [];

  return <SalesCreateClient customers={customers} products={products} />;
}

export default function NewSalesOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Sales Order Creation Form...
          </p>
        </div>
      }
    >
      <NewSalesOrderContent />
    </Suspense>
  );
}
