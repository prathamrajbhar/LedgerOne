import { ContactForm } from "../../contact-form";
import { getContactByIdAction } from "@/app/actions/contact.actions";
import { notFound } from "next/navigation";
import { Contact } from "@prisma/client";

interface EditContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { id } = await params;
  const result = await getContactByIdAction(id);

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
    city: contactData.city || "",
    state: contactData.state || "",
    pincode: contactData.pincode || "",
    profileImage: contactData.profileImage || "",
  };

  return <ContactForm initialData={contact} isEdit />;
}
