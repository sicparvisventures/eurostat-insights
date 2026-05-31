"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
  homeHref?: string;
}

export function AppHeader({
  title,
  subtitle,
  back,
  action,
  homeHref = "/home",
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="pt-safe bg-background/80 sticky top-0 z-30 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-5 py-3">
        {back ? (
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="hover:bg-muted -ml-2 flex size-9 items-center justify-center rounded-full transition-colors"
          >
            <Icon name="ChevronLeft" className="size-5" />
          </button>
        ) : (
          <Link href={homeHref} aria-label="Home">
            <Logo size={34} />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {title ? (
            <>
              <h1 className="truncate text-lg font-bold leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground truncate text-xs">
                  {subtitle}
                </p>
              )}
            </>
          ) : (
            <span className="text-base font-bold tracking-tight">
              Eurostat <span className="text-primary">Insights</span>
            </span>
          )}
        </div>

        {action}
      </div>
    </header>
  );
}
