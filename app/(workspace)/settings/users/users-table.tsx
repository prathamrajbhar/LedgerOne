"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  toggleUserStatusAction,
  resendContactPortalInvitationAction,
  deleteUserAction,
  getUsersAction,
} from "@/app/actions/user-management.actions";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Power,
  Mail,
  Loader2,
  Trash2,
  Search,
  Users,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface UsersTableProps {
  initialUsers: SystemUser[];
  initialTotal: number;
  initialTotalPages: number;
  currentUserId?: string;
}

export function UsersTable({
  initialUsers,
  initialTotal,
  initialTotalPages,
  currentUserId,
}: UsersTableProps) {
  const router = useRouter();

  // Data & Pagination State
  const [users, setUsers] = React.useState<SystemUser[]>(initialUsers);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [totalItems, setTotalItems] = React.useState(initialTotal);
  const [loading, setLoading] = React.useState(false);

  // Search & Filter State
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Action states
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<SystemUser | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Debounce search input by 300ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search term
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filters change
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Fetch paginated & filtered users from server
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const role = roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined;
      const isActive =
        statusFilter === "ACTIVE" ? true : statusFilter === "INACTIVE" ? false : undefined;

      const res = await getUsersAction({
        search: debouncedSearch || undefined,
        role,
        isActive,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setUsers(res.data.users as SystemUser[]);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.total);
      } else {
        toast.error(res.error || "Failed to load users");
      }
    } catch {
      toast.error("An error occurred while loading users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  // Run query when search, filters, or page change
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setTogglingId(userId);
    try {
      const res = await toggleUserStatusAction(userId, !currentStatus);
      if (res.success) {
        toast.success(`User marked as ${!currentStatus ? "Active" : "Inactive"}`);
        fetchUsers();
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

  const handleResendEmail = async (userId: string, userEmail: string) => {
    setResendingId(userId);
    try {
      const res = await resendContactPortalInvitationAction(userId);
      if (res.success && res.data) {
        const inv = res.data as { emailSent: boolean; emailError?: string };
        if (inv.emailSent) {
          toast.success(`Invitation email resent to ${userEmail}!`);
        } else {
          toast.warning(`Credentials reset, but email failed: ${inv.emailError || "Check SMTP"}`);
        }
        return;
      }
      toast.error(res.error || "Failed to resend invitation email");
    } catch {
      toast.error("An error occurred while resending email");
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const res = await deleteUserAction(userToDelete.id);
      if (res.success) {
        toast.success(`User ${userToDelete.name || userToDelete.loginId} permanently deleted.`);
        setUserToDelete(null);
        fetchUsers();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete user.");
      }
    } catch {
      toast.error("An error occurred while deleting user.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const activeFiltersCount =
    (roleFilter !== "ALL" ? 1 : 0) + (statusFilter !== "ALL" ? 1 : 0) + (searchInput ? 1 : 0);

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
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-border shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input with Debouncing indicator */}
        <div className="relative flex-1 max-w-md">
          {loading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, login ID, or company..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-border bg-[#F8FAFC] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-navy focus:bg-white transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="h-8.5 px-2.5 py-1 text-xs rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMINISTRATOR">Administrator</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="CONTACT">Portal User</option>
          </select>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-8.5 px-2.5 py-1 text-xs rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8.5 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Users Count Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{users.length}</strong> of{" "}
          <strong className="text-foreground">{totalItems}</strong> users (Page {page} of {totalPages})
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-navy font-medium">Filtered results</span>
        )}
      </div>

      {/* Users Data Table */}
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="font-medium text-sm text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeFiltersCount > 0
                        ? "Try clearing filters or changing your search terms."
                        : "No user accounts have been created yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isToggling = togglingId === user.id;
                  const isResending = resendingId === user.id;
                  const isSelf = currentUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-primary-light/30 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{user.name || "Unnamed User"}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-primary-light text-navy font-bold px-1.5 py-0.2 rounded border border-navy/20">
                              You
                            </span>
                          )}
                        </div>
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
                        <div className="flex items-center justify-end gap-1">
                          {user.role === UserRole.CONTACT && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isResending}
                              onClick={() => handleResendEmail(user.id, user.email)}
                              className="h-8 px-2 text-xs text-navy hover:text-navy-dark hover:bg-slate-100 gap-1"
                              title="Resend invitation email with new temporary password"
                            >
                              {isResending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Mail className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">Resend Email</span>
                            </Button>
                          )}

                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isToggling}
                              onClick={() => handleToggle(user.id, user.isActive)}
                              className={`h-8 px-2.5 text-xs ${
                                user.isActive
                                  ? "text-muted-foreground hover:text-amber-700 hover:bg-amber-50"
                                  : "text-green-700 hover:text-green-800 hover:bg-green-50"
                              }`}
                              title={user.isActive ? "Deactivate user access" : "Re-activate user"}
                            >
                              <Power className="h-3.5 w-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">
                                {user.isActive ? "Deactivate" : "Activate"}
                              </span>
                            </Button>
                          )}

                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserToDelete(user)}
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                              title="Permanently delete user from database"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border bg-white px-4 py-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={10}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal for Permanent Deletion */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-foreground">
                Permanently Delete User?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete user{" "}
                <strong className="text-foreground font-semibold">
                  &quot;{userToDelete?.name || userToDelete?.loginId}&quot;
                </strong>{" "}
                ({userToDelete?.email})? This permanently deletes the record from the database.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs my-2">
            <p className="font-semibold mb-1">Safety Rule:</p>
            <p className="text-[11px] text-amber-800 leading-normal">
              Users with associated accounting transactions (invoices, bills, or journal entries) cannot be permanently destroyed to preserve the audit trail. For those accounts, use <strong>Deactivate</strong> instead.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
