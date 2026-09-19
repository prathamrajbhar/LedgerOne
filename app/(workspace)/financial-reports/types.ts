export interface BudgetReportLine {
  id: string;
  type: string;
  committedAmount: number | string;
  achievedAmount: number | string;
  achievedPercent: number | string;
  amountToAchieve: number | string;
  analyticAccount: {
    name: string;
    type: string;
  };
}

export interface BudgetReportItem {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  responsible?: {
    name: string | null;
  } | null;
  lines: BudgetReportLine[];
}
