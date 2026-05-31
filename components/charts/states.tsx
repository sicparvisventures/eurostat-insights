import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      <Skeleton className="h-full w-full" style={{ height }} />
    </div>
  );
}

export function EmptyState({
  title = "No data",
  message = "There's no data available for this selection.",
  icon = "Database",
  className,
}: {
  title?: string;
  message?: string;
  icon?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="bg-muted flex size-12 items-center justify-center rounded-2xl">
        <Icon name={icon} className="size-5" />
      </div>
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="max-w-xs text-xs">{message}</p>
    </div>
  );
}

export function ErrorState({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="bg-danger/10 text-danger flex size-12 items-center justify-center rounded-2xl">
        <Icon name="WifiOff" className="size-5" />
      </div>
      <div>
        <p className="text-foreground text-sm font-semibold">
          Couldn&apos;t load data
        </p>
        <p className="text-xs">Check your connection and try again.</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold"
        >
          <Icon name="RefreshCw" className="size-4" /> Retry
        </button>
      )}
    </div>
  );
}
