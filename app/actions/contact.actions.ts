"use server";

import { revalidatePath } from "next/cache";
import { contactService, CreateContactInput, UpdateContactInput, ListContactsParams } from "@/lib/services/contact.service";
import { ContactType, PrismaClient } from "@prisma/client";
import { ValidationError, ConflictError, NotFoundError } from "@/lib/utils/errors";
import { requireRole } from "@/lib/auth/session";

const prisma = new PrismaClient();

export interface ContactActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get paginated list of contacts with optional filters
 */
export async function getContactsAction(params?: {
  search?: string;
  type?: ContactType;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}): Promise<ContactActionResult> {
  try {
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
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return {
      success: false,
      error: "Failed to fetch contacts. Please try again.",
    };
  }
}

/**
 * Get a single contact by ID
 */
export async function getContactByIdAction(id: string): Promise<ContactActionResult> {
  try {
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
    console.error("Error fetching contact:", error);
    return {
      success: false,
      error: "Failed to fetch contact details. Please try again.",
    };
  }
}

/**
 * Create a new contact
 */
export async function createContactAction(input: CreateContactInput): Promise<ContactActionResult> {
  try {
    // Validate required fields
    if (!input.name?.trim()) {
      return {
        success: false,
        error: "Contact name is required",
      };
    }

    if (!input.email?.trim()) {
      return {
        success: false,
        error: "Email address is required",
      };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }

    if (!input.type) {
      return {
        success: false,
        error: "Contact type is required",
      };
    }

    const contact = await contactService.create(input);

    return {
      success: true,
      data: contact,
    };
  } catch (error) {
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: "A contact with this email already exists",
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error creating contact:", error);
    return {
      success: false,
      error: "Failed to create contact. Please try again.",
    };
  }
}

/**
 * Update an existing contact
 */
export async function updateContactAction(input: UpdateContactInput): Promise<ContactActionResult> {
  try {
    if (!input.id) {
      return {
        success: false,
        error: "Contact ID is required",
      };
    }

    // Email format validation if email is being updated
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return {
          success: false,
          error: "Please enter a valid email address",
        };
      }
    }

    const contact = await contactService.update(input);

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

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: "A contact with this email already exists",
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error updating contact:", error);
    return {
      success: false,
      error: "Failed to update contact. Please try again.",
    };
  }
}

/**
 * Archive a contact (soft delete)
 */
export async function archiveContactAction(id: string): Promise<ContactActionResult> {
  try {
    await contactService.archive(id);
    return {
      success: true,
      data: { message: "Contact archived successfully" },
    };
  } catch (error) {
    console.error("Error archiving contact:", error);
    return {
      success: false,
      error: "Failed to archive contact. Please try again.",
    };
  }
}

/**
 * Restore an archived contact
 */
export async function restoreContactAction(id: string): Promise<ContactActionResult> {
  try {
    await contactService.restore(id);
    revalidatePath("/contacts");
    return {
      success: true,
      data: { message: "Contact restored successfully" },
    };
  } catch (error) {
    console.error("Error restoring contact:", error);
    return {
      success: false,
      error: "Failed to restore contact. Please try again.",
    };
  }
}

/**
 * Check whether a contact can be hard-deleted or has linked transactions
 */
export async function checkCanDeleteContactAction(id: string): Promise<ContactActionResult<{ canDelete: boolean }>> {
  try {
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

/**
 * Hard delete a contact (Administrator only, records with zero transactions)
 */
export async function deleteContactAction(id: string): Promise<ContactActionResult> {
  try {
    await requireRole(["ADMINISTRATOR"]);

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
