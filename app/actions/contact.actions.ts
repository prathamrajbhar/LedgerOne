"use server";

import { contactService, CreateContactInput, UpdateContactInput, ListContactsParams } from "@/lib/services/contact.service";
import { ContactType } from "@prisma/client";
import { ValidationError, ConflictError, NotFoundError } from "@/lib/utils/errors";
import { requirePermission } from "@/lib/auth/guard";
import {
  archiveContactAction as archiveContact,
  restoreContactAction as restoreContact,
  checkCanDeleteContactAction as checkCanDelete,
  getContactUsageDetailsAction as getUsageDetails,
  deleteContactDependencyAction as deleteDependency,
  deleteContactAction as deleteContact,
} from "./contact-management.actions";

export interface ContactActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function archiveContactAction(id: string) {
  return archiveContact(id);
}

export async function restoreContactAction(id: string) {
  return restoreContact(id);
}

export async function checkCanDeleteContactAction(id: string) {
  return checkCanDelete(id);
}

export async function getContactUsageDetailsAction(id: string) {
  return getUsageDetails(id);
}

export async function deleteContactDependencyAction(type: string, id: string) {
  return deleteDependency(type, id);
}

export async function deleteContactAction(id: string) {
  return deleteContact(id);
}

export async function getContactsAction(params?: {
  search?: string;
  type?: ContactType;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}): Promise<ContactActionResult> {
  try {
    await requirePermission("masters:read");
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const offset = (page - 1) * limit;

    const listParams: ListContactsParams = {
      search: params?.search,
      type: params?.type,
      isArchived: params?.isArchived ?? false,
      limit,
      offset,
    };

    const result = await contactService.list(listParams);

    return {
      success: true,
      data: {
        contacts: result.data,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch contacts. Please try again.",
    };
  }
}

export async function getContactByIdAction(id: string): Promise<ContactActionResult> {
  try {
    await requirePermission("masters:read");
    const contact = await contactService.findById(id);
    return {
      success: true,
      data: contact,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Contact not found",
      };
    }
    return {
      success: false,
      error: "Failed to fetch contact details. Please try again.",
    };
  }
}

export async function createContactAction(input: CreateContactInput): Promise<ContactActionResult> {
  try {
    await requirePermission("masters:write");
    if (!input.name?.trim()) {
      return { success: false, error: "Contact name is required" };
    }
    if (!input.email?.trim()) {
      return { success: false, error: "Email address is required" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: "Please enter a valid email address" };
    }
    if (!input.type) {
      return { success: false, error: "Contact type is required" };
    }

    const contact = await contactService.create(input);
    return { success: true, data: contact };
  } catch (error) {
    if (error instanceof ConflictError) {
      return { success: false, error: "A contact with this email already exists" };
    }
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create contact. Please try again." };
  }
}

export async function updateContactAction(input: UpdateContactInput): Promise<ContactActionResult> {
  try {
    await requirePermission("masters:write");
    if (!input.id) {
      return { success: false, error: "Contact ID is required" };
    }
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return { success: false, error: "Please enter a valid email address" };
      }
    }

    const contact = await contactService.update(input);
    return { success: true, data: contact };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Contact not found" };
    }
    if (error instanceof ConflictError) {
      return { success: false, error: "A contact with this email already exists" };
    }
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update contact. Please try again." };
  }
}
