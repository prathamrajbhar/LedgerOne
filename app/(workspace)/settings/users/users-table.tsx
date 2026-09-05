"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleUserStatusAction } from "@/app/actions/user-management.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, ExternalLink, Power } from "lucide-react";
import { UserRole } from "@prisma/client";

export interface SystemUser {
  id: string;
  loginId: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  contact?: { id: string; name: string; type: string } | null;
}

export function UsersTable({ users }: { users: SystemUser[] }) {
  const router = useRouter();
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setTogglingId(userId);
    try {
      const res = await toggleUserStatusAction(userId, !currentStatus);
      if (res.success) {
        toast.success(`User marked as ${!currentStatus ? "Active" : "Inactive"}`);
        router.refresh();
        return;
      }
      toast.error(res.error || "Failed to update user status");
    } catch {
      toast.error("An error occurred");
    } finally {
      setTogglingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMINISTRATOR":
        return (
          <Badge variant="default" className="bg-navy text-white text-[10px] gap-1">
            <ShieldCheck className="h-3 w-3" /> Admin
          </Badge>
        );
      case "ACCOUNTANT":
        return (
          <Badge variant="secondary" className="bg-teal text-white text-[10px] gap-1">
            <UserCheck className="h-3 w-3" /> Accountant
          </Badge>
        );
      case "CONTACT":
        return (
          <Badge variant="outline" className="border-border text-muted-foreground text-[10px] gap-1">
            <ExternalLink className="h-3 w-3" /> Portal User
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Login ID</th>
              <th className="py-3.5 px-4">System Role</th>
              <th className="py-3.5 px-4">Associated Entity</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const isToggling = togglingId === user.id;

              return (
                <tr key={user.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{user.name || "Unnamed User"}</div>
                    <div className="text-[11px] text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-navy">{user.loginId}</td>
                  <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {user.contact ? (
                      <span className="font-medium text-foreground">
                        {user.contact.name} ({user.contact.type})
                      </span>
                    ) : (
                      <span>Internal Staff</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isToggling}
                      onClick={() => handleToggle(user.id, user.isActive)}
                      className={`h-8 px-2.5 text-xs ${
                        user.isActive
                          ? "text-muted-foreground hover:text-destructive"
                          : "text-green-700 hover:text-green-800"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5 mr-1" />
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
