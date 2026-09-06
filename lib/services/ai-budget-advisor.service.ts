import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { BudgetStatus } from "@prisma/client";

export type BudgetOverrunStatus = "SAFE" | "WARNING" | "EXCEEDED";

export interface BudgetImpactResult {
  hasBudget: boolean;
  status: BudgetOverrunStatus;
  budgetId?: string;
  budgetName?: string;
  analyticAccountId?: string;
  analyticAccountName?: string;
  committedAmount: number;
  currentAchieved: number;
  proposedAmount: number;
  newTotalSpent: number;
  currentPercentConsumed: number;
  newPercentConsumed: number;
  remainingAmount: number;
  warningMessage?: string;
}

export interface BudgetHealthAlert {
  budgetId: string;
  budgetName: string;
  analyticAccountId: string;
  analyticAccountName: string;
  committedAmount: number;
  achievedAmount: number;
  percentConsumed: number;
  status: BudgetOverrunStatus;
  alertText: string;
}

export class AiBudgetAdvisorService {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key" || apiKey.length < 10) {
      return null;
    }
    if (!this.client) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  /**
   * Check real-time impact of a proposed expenditure against active confirmed budgets
   */
  async checkBudgetImpact(analyticAccountId: string, proposedAmount: number): Promise<BudgetImpactResult> {
    if (!analyticAccountId || proposedAmount <= 0) {
      return {
        hasBudget: false,
        status: "SAFE",
        committedAmount: 0,
        currentAchieved: 0,
        proposedAmount: proposedAmount || 0,
        newTotalSpent: proposedAmount || 0,
        currentPercentConsumed: 0,
        newPercentConsumed: 0,
        remainingAmount: 0,
      };
    }

    const now = new Date();

    // Find active confirmed budget lines for this analytic account
    const budgetLine = await prisma.budgetLine.findFirst({
      where: {
        analyticAccountId,
        budget: {
          status: BudgetStatus.CONFIRMED,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      include: {
        budget: true,
        analyticAccount: true,
      },
    });

    if (!budgetLine) {
      // If no active date-range match, try finding any confirmed budget line
      const anyBudgetLine = await prisma.budgetLine.findFirst({
        where: {
          analyticAccountId,
          budget: {
            status: BudgetStatus.CONFIRMED,
          },
        },
        include: {
          budget: true,
          analyticAccount: true,
        },
      });

      if (!anyBudgetLine) {
        return {
          hasBudget: false,
          status: "SAFE",
          committedAmount: 0,
          currentAchieved: 0,
          proposedAmount,
          newTotalSpent: proposedAmount,
          currentPercentConsumed: 0,
          newPercentConsumed: 0,
          remainingAmount: 0,
        };
      }
      return this.calculateImpact(anyBudgetLine, proposedAmount);
    }

    return this.calculateImpact(budgetLine, proposedAmount);
  }

  private calculateImpact(
    line: {
      committedAmount: unknown;
      achievedAmount: unknown;
      analyticAccountId: string;
      analyticAccount: { name: string };
      budget: { id: string; name: string };
    },
    proposedAmount: number
  ): BudgetImpactResult {
    const committed = Number(line.committedAmount) || 0;
    const currentAchieved = Number(line.achievedAmount) || 0;
    const newTotalSpent = currentAchieved + proposedAmount;

    const currentPercent = committed > 0 ? (currentAchieved / committed) * 100 : 0;
    const newPercent = committed > 0 ? (newTotalSpent / committed) * 100 : 0;
    const remaining = Math.max(0, committed - currentAchieved);

    let status: BudgetOverrunStatus = "SAFE";
    let warningMessage: string | undefined = undefined;

    if (newPercent > 100) {
      status = "EXCEEDED";
      const overrunAmt = newTotalSpent - committed;
      warningMessage = `⚠️ Budget Overrun Warning: Adding ₹${proposedAmount.toLocaleString("en-IN")} will breach the '${line.analyticAccount.name}' budget in '${line.budget.name}' by ₹${overrunAmt.toLocaleString("en-IN")} (${newPercent.toFixed(1)}% consumed).`;
    } else if (newPercent >= 80) {
      status = "WARNING";
      warningMessage = `⚡ Budget Caution: Adding ₹${proposedAmount.toLocaleString("en-IN")} will push the '${line.analyticAccount.name}' budget in '${line.budget.name}' to ${newPercent.toFixed(1)}% capacity (₹${(committed - newTotalSpent).toLocaleString("en-IN")} remaining).`;
    }

    return {
      hasBudget: true,
      status,
      budgetId: line.budget.id,
      budgetName: line.budget.name,
      analyticAccountId: line.analyticAccountId,
      analyticAccountName: line.analyticAccount.name,
      committedAmount: committed,
      currentAchieved,
      proposedAmount,
      newTotalSpent,
      currentPercentConsumed: Math.round(currentPercent * 10) / 10,
      newPercentConsumed: Math.round(newPercent * 10) / 10,
      remainingAmount: remaining,
      warningMessage,
    };
  }

  /**
   * Get overall budget health alerts across all active budgets
   */
  async getBudgetHealthSummary(): Promise<{
    totalActiveBudgets: number;
    highRiskAlerts: BudgetHealthAlert[];
    overallCommitted: number;
    overallAchieved: number;
    overallPercent: number;
  }> {
    const activeBudgets = await prisma.budget.findMany({
      where: { status: BudgetStatus.CONFIRMED },
      include: {
        lines: {
          include: {
            analyticAccount: true,
          },
        },
      },
    });

    let overallCommitted = 0;
    let overallAchieved = 0;
    const highRiskAlerts: BudgetHealthAlert[] = [];

    for (const budget of activeBudgets) {
      for (const line of budget.lines) {
        const committed = Number(line.committedAmount) || 0;
        const achieved = Number(line.achievedAmount) || 0;
        overallCommitted += committed;
        overallAchieved += achieved;

        const percent = committed > 0 ? (achieved / committed) * 100 : 0;

        if (percent >= 80) {
          const status: BudgetOverrunStatus = percent >= 100 ? "EXCEEDED" : "WARNING";
          const alertText =
            status === "EXCEEDED"
              ? `'${line.analyticAccount.name}' in '${budget.name}' has exceeded budget limit by ₹${(achieved - committed).toLocaleString("en-IN")} (${percent.toFixed(1)}%).`
              : `'${line.analyticAccount.name}' in '${budget.name}' is running hot at ${percent.toFixed(1)}% capacity.`;

          highRiskAlerts.push({
            budgetId: budget.id,
            budgetName: budget.name,
            analyticAccountId: line.analyticAccountId,
            analyticAccountName: line.analyticAccount.name,
            committedAmount: committed,
            achievedAmount: achieved,
            percentConsumed: Math.round(percent * 10) / 10,
            status,
            alertText,
          });
        }
      }
    }

    const overallPercent = overallCommitted > 0 ? Math.round((overallAchieved / overallCommitted) * 1000) / 10 : 0;

    return {
      totalActiveBudgets: activeBudgets.length,
      highRiskAlerts,
      overallCommitted,
      overallAchieved,
      overallPercent,
    };
  }

  /**
   * Use Gemini 1.5 Flash AI to give intelligent budget reallocation & burn rate advice
   */
  async getSmartBudgetAdvice(): Promise<{
    adviceText: string;
    recommendations: string[];
    isAiGenerated: boolean;
  }> {
    const summary = await this.getBudgetHealthSummary();

    const client = this.getClient();
    if (client) {
      try {
        const model = client.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

        const prompt = `You are an expert CFO & Budget Advisor AI for LedgerOne ERP.
Analyze the following budget health statistics for the company:

- Total Active Budgets: ${summary.totalActiveBudgets}
- Overall Budget Committed: ₹${summary.overallCommitted.toLocaleString("en-IN")}
- Overall Budget Achieved: ₹${summary.overallAchieved.toLocaleString("en-IN")}
- Overall Consumption: ${summary.overallPercent}%
- High Risk / Over-budget Lines (${summary.highRiskAlerts.length}):
${JSON.stringify(summary.highRiskAlerts)}

Provide concise executive advice and 2-3 specific bulleted recommendations for budget reallocation or spending control.
Return ONLY raw JSON (no backticks, no markdown) with schema:
{
  "adviceText": "2-3 sentence executive overview",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        return {
          adviceText: parsed.adviceText || "Overall budget consumption is within parameters. Monitor high-capacity analytic lines closely.",
          recommendations: parsed.recommendations || ["Review active high-capacity accounts.", "Pause non-essential purchase orders for near-capacity accounts."],
          isAiGenerated: true,
        };
      } catch (err) {
        console.warn("Gemini budget advisor AI failed, falling back to heuristic recommendations:", err);
      }
    }

    // Heuristic Fallback
    return {
      adviceText: summary.highRiskAlerts.length > 0
        ? `Attention: ${summary.highRiskAlerts.length} analytic account(s) are currently running at or above 80% capacity.`
        : "Budget performance is healthy across all active analytic accounts.",
      recommendations: summary.highRiskAlerts.length > 0
        ? summary.highRiskAlerts.slice(0, 3).map((a) => a.alertText)
        : ["All analytic accounts are operating safely within allocated thresholds."],
      isAiGenerated: false,
    };
  }
}

export const aiBudgetAdvisorService = new AiBudgetAdvisorService();
