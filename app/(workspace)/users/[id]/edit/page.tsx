import * as React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { getUserByIdAction } from "@/app/actions/user-management.actions";
import { EditUserForm } from "./edit-user-form";
import { ArrowLeft } from "lucide-react";

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const userRes = await getUserByIdAction(id);

  if (!userRes.success || !userRes.data) {
    notFound();
  }

  const user = userRes.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="space-y-2">
        <Link
          href="/users"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to User Management
        </Link>
      </div>

      <EditUserForm initialUser={user} currentUserId={session.user.id} />
    </div>
  );
}
