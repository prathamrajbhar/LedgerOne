"use server";

import {
  aiTransactionCategorizerService,
  CategorizeTransactionInput,
} from "@/lib/services/ai-transaction-categorizer.service";
import { aiBudgetAdvisorService } from "@/lib/services/ai-budget-advisor.service";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Server Action: AI Transaction Categorization
 */
export async function categorizeTransactionAction(input: CategorizeTransactionInput) {
  try {
    const result = await aiTransactionCategorizerService.categorizeTransaction(input);
    return { success: true, data: serialize(result) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to categorize transaction" };
  }
}

/**
 * Server Action: Check Real-time Budget Impact for Proposed Expense/Purchase
 */
export async function checkBudgetImpactAction(analyticAccountId: string, proposedAmount: number) {
  try {
    const result = await aiBudgetAdvisorService.checkBudgetImpact(analyticAccountId, proposedAmount);
    return { success: true, data: serialize(result) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to calculate budget impact" };
  }
}

/**
 * Server Action: Get Budget Health Summary & High Risk Alerts
 */
export async function getBudgetHealthSummaryAction() {
  try {
    const result = await aiBudgetAdvisorService.getBudgetHealthSummary();
    return { success: true, data: serialize(result) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch budget health summary" };
  }
}

/**
 * Server Action: Get Gemini AI Smart Budget Reallocation Advice
 */
export async function getSmartBudgetAdviceAction() {
  try {
    const result = await aiBudgetAdvisorService.getSmartBudgetAdvice();
    return { success: true, data: serialize(result) };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch smart budget advice" };
  }
}
