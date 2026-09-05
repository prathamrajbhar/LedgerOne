import { ContactForm } from "../../contact-form";

export default function EditContactPage({ params }: { params: { id: string } }) {
  const contact = {
    id: params.id,
    name: "Modern Living Interiors Pvt Ltd",
    type: "CUSTOMER" as const,
    email: "procurement@modernliving.in",
    phone: "+91 98201 44556",
    address: "Bandra Kurla Complex, Commercial Tower B, Mumbai, MH - 400051",
    taxNumber: "27AAAAA1234A1Z5",
    creditLimit: "300000",
  };

  return <ContactForm initialData={contact} isEdit />;
}
