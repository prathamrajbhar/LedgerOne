import * as React from "react";
import { getUserProfileAction } from "@/app/actions/profile.actions";
import { ProfileClient } from "./profile-client";

export const metadata = {
  title: "My Profile - LedgerOne",
  description: "Manage your user profile and workspace credentials",
};

export default async function ProfilePage() {
  const result = await getUserProfileAction();

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">User Profile Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {result.error || "Unable to locate an active user account in the database."}
        </p>
      </div>
    );
  }

  return <ProfileClient initialProfile={result.data} />;
}
