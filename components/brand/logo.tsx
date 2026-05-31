import { cn } from "@/lib/utils";

/** Brand mark — a flat, solid glyph. Fixed colour in both themes. */
export const BRAND = "#283142";

export function Logo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="48" height="48" rx="11" fill={BRAND} />
      <g fill="#fff">
        <rect x="12" y="27" width="5" height="9" rx="1" fillOpacity="0.7" />
        <rect x="21.5" y="20" width="5" height="16" rx="1" fillOpacity="0.85" />
        <rect x="31" y="13" width="5" height="23" rx="1" />
      </g>
    </svg>
  );
}

export function LogoWord({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={32} />
      <span className="text-lg font-semibold tracking-tight">
        Eurostat Insights
      </span>
    </div>
  );
}
