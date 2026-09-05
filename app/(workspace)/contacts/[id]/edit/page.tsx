import { ContactForm } from "../../contact-form";
import { getContactByIdAction } from "@/app/actions/contact.actions";
import { notFound } from "next/navigation";

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const result = await getContactByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const contact = {
    id: result.data.id,
    name: result.data.name,
    type: result.data.type,
    email: result.data.email,
    phone: result.data.phone || "",
    address: result.data.address || "",
  };

  return <ContactForm initialData={contact} isEdit />;
}
