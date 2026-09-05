"use server";

import {
  chartOfAccountsService,
  CreateAccountInput,
  UpdateAccountInput,
  ListAccountsParams,
} from "@/lib/services/chart-of-accounts.service";
import {
  journalService,
  CreateJournalInput,
  UpdateJournalInput,
  ListJournalsParams,
} from "@/lib/services/journal.service";
import { AccountType, JournalType } from "@prisma/client";
import { ValidationError, ConflictError, NotFoundError } from "@/lib/utils/errors";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// CHART OF ACCOUNTS ACTIONS
// ============================================================================

/**
 * Get list of chart of accounts with optional filters
 */
export async function getChartOfAccountsAction(params?: {
  search?: string;
  type?: AccountType;
  includeArchived?: boolean;
}): Promise<ActionResult> {
  try {
    const listParams: ListAccountsParams = {
      search: params?.search,
      type: params?.type,
      includeArchived: params?.includeArchived ?? false,
    };

    const accounts = await chartOfAccountsService.list(listParams);

    return {
      success: true,
      data: accounts,
    };
  } catch (error) {
    console.error("Error fetching chart of accounts:", error);
    return {
      success: false,
      error: "Failed to fetch chart of accounts. Please try again.",
    };
  }
}

/**
 * Get a single account by ID
 */
export async function getAccountByIdAction(id: string): Promise<ActionResult> {
  try {
    const account = await chartOfAccountsService.findById(id);
    return {
      success: true,
      data: account,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Account not found",
      };
    }
    console.error("Error fetching account:", error);
    return {
      success: false,
      error: "Failed to fetch account details. Please try again.",
    };
  }
}

/**
 * Create a new account
 */
export async function createAccountAction(input: CreateAccountInput): Promise<ActionResult> {
  try {
    // Validate required fields
    if (!input.code?.trim()) {
      return {
        success: false,
        error: "Account code is required",
      };
    }

    if (!input.name?.trim()) {
      return {
        success: false,
        error: "Account name is required",
      };
    }

    if (!input.type) {
      return {
        success: false,
        error: "Account type is required",
      };
    }

    const account = await chartOfAccountsService.create(input);

    return {
      success: true,
      data: account,
    };
  } catch (error) {
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error creating account:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}

/**
 * Update an existing account
 */
export async function updateAccountAction(input: UpdateAccountInput): Promise<ActionResult> {
  try {
    if (!input.id) {
      return {
        success: false,
        error: "Account ID is required",
      };
    }

    const account = await chartOfAccountsService.update(input);

    return {
      success: true,
      data: account,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error updating account:", error);
    return {
      success: false,
      error: "Failed to update account. Please try again.",
    };
  }
}

/**
 * Archive an account (soft delete)
 */
export async function archiveAccountAction(id: string): Promise<ActionResult> {
  try {
    await chartOfAccountsService.archive(id);
    return {
      success: true,
      data: { message: "Account archived successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error archiving account:", error);
    return {
      success: false,
      error: "Failed to archive account. Please try again.",
    };
  }
}

/**
 * Restore an archived account
 */
export async function restoreAccountAction(id: string): Promise<ActionResult> {
  try {
    await chartOfAccountsService.restore(id);
    return {
      success: true,
      data: { message: "Account restored successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error restoring account:", error);
    return {
      success: false,
      error: "Failed to restore account. Please try again.",
    };
  }
}

/**
 * Get selectable accounts (non-archived) for dropdowns
 */
export async function getSelectableAccountsAction(type?: AccountType): Promise<ActionResult> {
  try {
    const accounts = await chartOfAccountsService.getSelectableAccounts(type);
    return {
      success: true,
      data: accounts,
    };
  } catch (error) {
    console.error("Error fetching selectable accounts:", error);
    return {
      success: false,
      error: "Failed to fetch accounts. Please try again.",
    };
  }
}

// ============================================================================
// JOURNAL ACTIONS
// ============================================================================

/**
 * Get list of journals with optional filters
 */
export async function getJournalsAction(params?: {
  search?: string;
  type?: JournalType;
}): Promise<ActionResult> {
  try {
    const listParams: ListJournalsParams = {
      search: params?.search,
      type: params?.type,
    };

    const journals = await journalService.list(listParams);

    return {
      success: true,
      data: journals,
    };
  } catch (error) {
    console.error("Error fetching journals:", error);
    return {
      success: false,
      error: "Failed to fetch journals. Please try again.",
    };
  }
}

/**
 * Get a single journal by ID
 */
export async function getJournalByIdAction(id: string): Promise<ActionResult> {
  try {
    const journal = await journalService.findById(id);
    return {
      success: true,
      data: journal,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Journal not found",
      };
    }
    console.error("Error fetching journal:", error);
    return {
      success: false,
      error: "Failed to fetch journal details. Please try again.",
    };
  }
}

/**
 * Create a new journal
 */
export async function createJournalAction(input: CreateJournalInput): Promise<ActionResult> {
  try {
    // Validate required fields
    if (!input.code?.trim()) {
      return {
        success: false,
        error: "Journal code is required",
      };
    }

    if (!input.name?.trim()) {
      return {
        success: false,
        error: "Journal name is required",
      };
    }

    if (!input.type) {
      return {
        success: false,
        error: "Journal type is required",
      };
    }

    if (!input.defaultAccountId) {
      return {
        success: false,
        error: "Default account is required",
      };
    }

    const journal = await journalService.create(input);

    return {
      success: true,
      data: journal,
    };
  } catch (error) {
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error creating journal:", error);
    return {
      success: false,
      error: "Failed to create journal. Please try again.",
    };
  }
}

/**
 * Update an existing journal
 */
export async function updateJournalAction(input: UpdateJournalInput): Promise<ActionResult> {
  try {
    if (!input.id) {
      return {
        success: false,
        error: "Journal ID is required",
      };
    }

    const journal = await journalService.update(input);

    return {
      success: true,
      data: journal,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Journal not found",
      };
    }

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error updating journal:", error);
    return {
      success: false,
      error: "Failed to update journal. Please try again.",
    };
  }
}

/**
 * Delete a journal (only if it has no journal entries)
 */
export async function deleteJournalAction(id: string): Promise<ActionResult> {
  try {
    await journalService.delete(id);
    return {
      success: true,
      data: { message: "Journal deleted successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Journal not found",
      };
    }

    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Error deleting journal:", error);
    return {
      success: false,
      error: "Failed to delete journal. Please try again.",
    };
  }
}
