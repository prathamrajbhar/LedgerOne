"use server";

import { revalidatePath } from "next/cache";
import { contactService } from "@/lib/services/contact.service";
import { requirePermission } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { ContactActionResult } from "./contact.actions";

export async function archiveContactAction(id: string): Promise<ContactActionResult> {
  try {
    await requirePermission("masters:write");
    await contactService.archive(id);
    return {
      success: true,
      data: { message: "Contact archived successfully" },
    };
  } catch {
    return {
      success: false,
      error: "Failed to archive contact. Please try again.",
    };
  }
}

export async function restoreContactAction(id: string): Promise<ContactActionResult> {
  try {
    await requirePermission("masters:write");
    await contactService.restore(id);
    revalidatePath("/contacts");
    return {
      success: true,
      data: { message: "Contact restored successfully" },
    };
  } catch {
    return {
      success: false,
      error: "Failed to restore contact. Please try again.",
    };
  }
}

export async function checkCanDeleteContactAction(id: string): Promise<ContactActionResult<{ canDelete: boolean }>> {
  try {
    await requirePermission("masters:read");
    const canDelete = await contactService.canDelete(id);
    return {
      success: true,
      data: { canDelete },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check contact usage";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getContactUsageDetailsAction(id: string): Promise<ContactActionResult<Awaited<ReturnType<typeof contactService.getUsageDetails>>>> {
  try {
    await requirePermission("masters:read");
    const details = await contactService.getUsageDetails(id);
    return {
      success: true,
      data: details,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get contact usage details";
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteContactDependencyAction(type: string, id: string): Promise<ContactActionResult> {
  try {
    await requirePermission("settings:manage");
    await contactService.deleteDependency(type, id);
    revalidatePath("/contacts");
    return {
      success: true,
      data: { message: "Related document removed successfully" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove dependency";
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteContactAction(id: string): Promise<ContactActionResult> {
  try {
    await requirePermission("settings:manage");

    const canDelete = await contactService.canDelete(id);
    if (!canDelete) {
      return {
        success: false,
        error: "Cannot delete contact with linked sales orders, invoices, or bills. Please archive instead.",
      };
    }

    await prisma.contact.delete({
      where: { id },
    });

    revalidatePath("/contacts");
    return {
      success: true,
      data: { message: "Contact deleted permanently" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete contact";
    return {
      success: false,
      error: message,
    };
  }
}
