import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { PageHeader } from "@/components/ui/page-header";
import { PortalInvoicesTable } from "./portal-invoices-table";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function PortalInvoicesPage() {
  // Retrieve contact from session or fallback to first active customer for demo/testing
  const contact = await prisma.contact.findFirst({
    where: { type: { in: ["CUSTOMER", "BOTH"] } },
  });

  const invoices = contact
    ? await customerInvoiceService.listForContact(contact.id)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invoices"
        description={
          contact
            ? `Viewing billing statements for ${contact.name}`
            : "Review invoices and settle balances online via secure checkout."
        }
      />
      <PortalInvoicesTable data={invoices} />
    </div>
  );
}
