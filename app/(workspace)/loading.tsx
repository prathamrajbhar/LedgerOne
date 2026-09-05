import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <LoadingSpinner size={40} />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">
        Loading workspace data...
      </p>
    </div>
  );
}
