"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Package, Archive, RotateCcw, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  archiveProductAction,
  restoreProductAction,
  deleteProductAction,
  getProductUsageDetailsAction,
  deleteProductDependencyAction,
} from "@/app/actions/product.actions";
import {
  DestructiveConfirmDialog,
  ConfirmActionType,
  UsageDetails,
} from "@/components/ui/destructive-confirm-dialog";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { UserRole } from "@prisma/client";

export interface FurnitureProductItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  material: string;
  cost: number;
  salesPrice: number;
  stock: number;
  reorderPoint: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  isArchived?: boolean;
}

interface ProductsTableProps {
  products: FurnitureProductItem[];
  onStockAdjust?: (product: FurnitureProductItem) => void;
}

export function ProductsTable({ products, onStockAdjust: _onStockAdjust }: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isArchivedTab = searchParams.get("status") === "ARCHIVED";

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMINISTRATOR;

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    type: ConfirmActionType;
    product: FurnitureProductItem | null;
    isReferenced: boolean;
    checkingUsage: boolean;
    usageDetails: UsageDetails | null;
  }>({
    open: false,
    type: "archive",
    product: null,
    isReferenced: false,
    checkingUsage: false,
    usageDetails: null,
  });

  const handleOpenDialog = async (type: ConfirmActionType, product: FurnitureProductItem) => {
    if (type === "delete") {
      setConfirmDialog({
        open: true,
        type: "delete",
        product,
        isReferenced: false,
        checkingUsage: true,
        usageDetails: null,
      });

      const res = await getProductUsageDetailsAction(product.id);
      if (res.success && res.data) {
        const details = res.data;
        setConfirmDialog((prev) => ({
          ...prev,
          isReferenced: !details.canDelete,
          usageDetails: details,
          checkingUsage: false,
        }));
      } else {
        setConfirmDialog((prev) => ({
          ...prev,
          checkingUsage: false,
        }));
      }
    } else {
      setConfirmDialog({
        open: true,
        type,
        product,
        isReferenced: false,
        checkingUsage: false,
        usageDetails: null,
      });
    }
  };

  const handleDeleteDependency = async (type: string, id: string, lineId?: string) => {
    if (!confirmDialog.product) return;
    const res = await deleteProductDependencyAction(type, id, lineId);
    if (res.success) {
      toast.success("Linked reference removed");
      // Re-fetch usage details
      const refreshed = await getProductUsageDetailsAction(confirmDialog.product.id);
      if (refreshed.success && refreshed.data) {
        setConfirmDialog((prev) => ({
          ...prev,
          isReferenced: !refreshed.data?.canDelete,
          usageDetails: refreshed.data || null,
        }));
      }
      router.refresh();
    } else {
      toast.error(res.error || "Failed to remove linked document");
    }
  };

  const handleExecuteAction = async () => {
    if (!confirmDialog.product) return;
    const { id, name } = confirmDialog.product;

    // If deleting from active tab with references -> archive it
    if (confirmDialog.type === "archive" || (confirmDialog.type === "delete" && !isArchivedTab && confirmDialog.isReferenced)) {
      const res = await archiveProductAction(id);
      if (res.success) {
        toast.success(`Product "${name}" archived successfully`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to archive product");
      }
    } else if (confirmDialog.type === "restore") {
      const res = await restoreProductAction(id);
      if (res.success) {
        toast.success(`Product "${name}" restored successfully`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to restore product");
      }
    } else if (confirmDialog.type === "delete") {
      const res = await deleteProductAction(id);
      if (res.success) {
        toast.success(`Product "${name}" deleted permanently`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Product & SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Material / Finish</th>
              <th className="py-3.5 px-4 text-right">Cost Price</th>
              <th className="py-3.5 px-4 text-right">Selling Price</th>
              <th className="py-3.5 px-4 text-center">Stock Level</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  No furniture products found.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-primary-light/30 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-light text-teal font-bold text-xs border border-teal/10 flex-shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="font-semibold text-foreground hover:text-navy hover:underline block"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {item.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {item.material}
                  </td>
                  <td className="py-3.5 px-4 text-right text-muted-foreground">
                    ₹{item.cost.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{item.salesPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-foreground">
                    {item.stock} units
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${item.id}/edit`} className="gap-2">
                            <Edit className="h-3.5 w-3.5" />
                            Edit Product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${item.id}`}>View Specs</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.info(`Stock adjustment initiated for ${item.sku}`)}
                        >
                          Adjust Stock Count
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices`}>Create Invoice Line</Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {item.isArchived ? (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog("restore", item)}
                            className="text-navy gap-2"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore Product
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog("archive", item)}
                            className="text-amber-700 gap-2"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Archive Product
                          </DropdownMenuItem>
                        )}

                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog("delete", item)}
                            className="text-destructive focus:text-destructive gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Permanently
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.product && (
        <DestructiveConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
          actionType={confirmDialog.type}
          recordName={confirmDialog.product.name}
          recordType="Product"
          isReferenced={confirmDialog.isReferenced}
          checkingUsage={confirmDialog.checkingUsage}
          usageDetails={confirmDialog.usageDetails}
          isArchivedTab={isArchivedTab}
          onDeleteDependency={handleDeleteDependency}
          onConfirm={handleExecuteAction}
        />
      )}
    </div>
  );
}
