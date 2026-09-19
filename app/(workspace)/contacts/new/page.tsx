import * as React from "react";
import { ContactForm } from "../contact-form";

export default function NewContactPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading contact form...</div>}>
      <ContactForm />
    </React.Suspense>
  );
}
