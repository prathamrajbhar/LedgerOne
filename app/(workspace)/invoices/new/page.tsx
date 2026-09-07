import * as React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getTaxRatesAction } from "@/app/actions/tax-rate.actions";
import { getSalesOrdersAction } from "@/app/actions/sales.actions";
import type { Contact, Product } from "@prisma/client";
import { InvoiceCreateClient } from "./invoice-create-client";

async function NewInvoiceContent() {
  const [contactsRes, productsRes, taxRes, soRes] = await Promise.all([
    getContactsAction({ type: "CUSTOMER", limit: 100 }),
    getProductsAction({ limit: 100 }),
    getTaxRatesAction(),
    getSalesOrdersAction(),
  ]);

  const customers =
    contactsRes.success && contactsRes.data
      ? ((contactsRes.data as { contacts?: Contact[] }).contacts || [])
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

  return (
    <InvoiceCreateClient
      customers={customers}
      salesOrders={salesOrders}
      products={products}
      taxRates={taxRates}
    />
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading Invoice Creation Form...
          </p>
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
