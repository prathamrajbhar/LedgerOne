import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  format,
  parseISO,
} from "date-fns";

export interface AccountingPeriodOption {
  key: string;
  label: string;
  startDate: string; // ISO format "YYYY-MM-DD"
  endDate: string;   // ISO format "YYYY-MM-DD"
}

export interface ResolvedAccountingPeriod {
  activeOption: AccountingPeriodOption;
  label: string;
  range: string;     // e.g. "01 Sep 2026 - 30 Sep 2026"
  startDate: string;
  endDate: string;
  start: Date;
  end: Date;
}

/**
 * Returns available standard accounting periods relative to the reference date.
 */
export function getAccountingPeriods(referenceDate: Date = new Date()): AccountingPeriodOption[] {
  const now = referenceDate;

  // 1. This Month
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // 2. Last Month
  const prevMonth = subMonths(now, 1);
  const prevMonthStart = startOfMonth(prevMonth);
  const prevMonthEnd = endOfMonth(prevMonth);

  // 3. Current Quarter
  const currentQuarterStart = startOfQuarter(now);
  const currentQuarterEnd = endOfQuarter(now);

  // 4. Indian Financial Year (April 1 to March 31)
  const currentYear = now.getFullYear();
  const fyStartYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
  const fyStart = new Date(fyStartYear, 3, 1); // 1st April
  const fyEnd = new Date(fyStartYear + 1, 2, 31); // 31st March

  // 5. Previous Financial Year
  const prevFyStart = new Date(fyStartYear - 1, 3, 1);
  const prevFyEnd = new Date(fyStartYear, 2, 31);

  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  return [
    {
      key: "this-month",
      label: `This Month (${format(now, "MMM yyyy")})`,
      startDate: fmt(currentMonthStart),
      endDate: fmt(currentMonthEnd),
    },
    {
      key: "last-month",
      label: `Last Month (${format(prevMonth, "MMM yyyy")})`,
      startDate: fmt(prevMonthStart),
      endDate: fmt(prevMonthEnd),
    },
    {
      key: "this-quarter",
      label: `Current Quarter (${format(currentQuarterStart, "MMM")} - ${format(currentQuarterEnd, "MMM yyyy")})`,
      startDate: fmt(currentQuarterStart),
      endDate: fmt(currentQuarterEnd),
    },
    {
      key: "current-fy",
      label: `FY ${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`,
      startDate: fmt(fyStart),
      endDate: fmt(fyEnd),
    },
    {
      key: "previous-fy",
      label: `Previous FY (${fyStartYear - 1}-${fyStartYear.toString().slice(-2)})`,
      startDate: fmt(prevFyStart),
      endDate: fmt(prevFyEnd),
    },
    {
      key: "all-time",
      label: "All Time",
      startDate: "2020-01-01",
      endDate: fmt(new Date(currentYear + 1, 11, 31)),
    },
  ];
}

/**
 * Resolves period parameters into a consistent ResolvedAccountingPeriod.
 */
export function resolveAccountingPeriod(
  periodKey?: string | null,
  fromParam?: string | null,
  toParam?: string | null,
  referenceDate: Date = new Date()
): ResolvedAccountingPeriod {
  const periods = getAccountingPeriods(referenceDate);
  const defaultPeriod = periods[0]; // "this-month"

  // 1. Explicit from and to date params take highest precedence
  if (fromParam && toParam) {
    const matched = periods.find(
      (p) => p.startDate === fromParam && p.endDate === toParam
    );

    const activeOption: AccountingPeriodOption = matched || {
      key: periodKey || "custom",
      label: "Custom Period",
      startDate: fromParam,
      endDate: toParam,
    };

    try {
      const fromDate = parseISO(fromParam);
      const toDate = parseISO(toParam);
      const range = `${format(fromDate, "dd MMM yyyy")} - ${format(toDate, "dd MMM yyyy")}`;
      return {
        activeOption,
        label: activeOption.label,
        range,
        startDate: fromParam,
        endDate: toParam,
        start: fromDate,
        end: toDate,
      };
    } catch {
      // Fall through to default if date parsing fails
    }
  }

  // 2. Preset period key lookup
  if (periodKey) {
    const found = periods.find((p) => p.key === periodKey);
    if (found) {
      try {
        const fromDate = parseISO(found.startDate);
        const toDate = parseISO(found.endDate);
        const range = `${format(fromDate, "dd MMM yyyy")} - ${format(toDate, "dd MMM yyyy")}`;
        return {
          activeOption: found,
          label: found.label,
          range,
          startDate: found.startDate,
          endDate: found.endDate,
          start: fromDate,
          end: toDate,
        };
      } catch {
        // Fall through
      }
    }
  }

  // 3. Fallback to default (This Month)
  const fromDate = parseISO(defaultPeriod.startDate);
  const toDate = parseISO(defaultPeriod.endDate);
  const range = `${format(fromDate, "dd MMM yyyy")} - ${format(toDate, "dd MMM yyyy")}`;

  return {
    activeOption: defaultPeriod,
    label: defaultPeriod.label,
    range,
    startDate: defaultPeriod.startDate,
    endDate: defaultPeriod.endDate,
    start: fromDate,
    end: toDate,
  };
}
