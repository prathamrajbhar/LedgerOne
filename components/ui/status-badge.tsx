import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
  NOT_PAID: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
  PARTIAL: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
  POSTED: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
  REVISED: "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status ? status.toUpperCase() : "DRAFT";
  const customClass =
    statusStyles[normalized] ||
    "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";

  return (
    <Badge
      variant="outline"
      className={`font-semibold tracking-wide capitalize px-2.5 py-0.5 text-xs transition-colors ${customClass}`}
    >
      {status ? status.toLowerCase().replace("_", " ") : "Draft"}
    </Badge>
  );
}
