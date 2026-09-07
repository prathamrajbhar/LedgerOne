import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "CONTACT") {
      redirect("/portal/dashboard");
    }
    redirect("/dashboard");
  }
  redirect("/login");
}
