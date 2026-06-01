import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND_NAME, BRAND_TAGLINE, BRAND_CREATOR } from "@/lib/brand";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-border mt-16 border-t pt-10">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-[15px] font-semibold tracking-tight">
              {BRAND_NAME}
            </span>
          </div>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {BRAND_TAGLINE}. Official European statistics, made legible — and a
            hospitality forecast built on top.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wide">
              Product
            </p>
            <Link href="/explore" className="hover:text-foreground text-muted-foreground">
              Explore data
            </Link>
            <Link href="/topics" className="hover:text-foreground text-muted-foreground">
              Topics
            </Link>
            <Link
              href="/business/home"
              className="hover:text-foreground text-muted-foreground"
            >
              Business Mode
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wide">
              Legal
            </p>
            <Link href="/privacy" className="hover:text-foreground text-muted-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground text-muted-foreground">
              Terms
            </Link>
            <a
              href="https://ec.europa.eu/eurostat"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground text-muted-foreground"
            >
              Data: Eurostat
            </a>
          </div>
        </div>
      </div>

      <div className="border-border text-muted-foreground/70 mt-8 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>
          Educational project. Data © European Union, 1995–{year}. Weather via
          Open-Meteo.
        </p>
        <p>
          Crafted by{" "}
          <span className="text-foreground font-semibold">{BRAND_CREATOR}</span>
        </p>
      </div>
    </footer>
  );
}
