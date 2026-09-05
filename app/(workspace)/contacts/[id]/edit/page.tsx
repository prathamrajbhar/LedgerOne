import { ContactForm } from "../../contact-form";
import { getContactByIdAction } from "@/app/actions/contact.actions";
import { notFound } from "next/navigation";
import { Contact } from "@prisma/client";

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const result = await getContactByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const contactData = result.data as Contact;

  const contact = {
    id: contactData.id,
    name: contactData.name,
    type: contactData.type,
    email: contactData.email,
    phone: contactData.phone || "",
    address: contactData.address || "",
  };

  return <ContactForm initialData={contact} isEdit />;
}
