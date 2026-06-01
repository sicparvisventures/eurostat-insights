import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SiteFooter } from "@/components/landing/site-footer";
import { BRAND_NAME } from "@/lib/brand";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-5 lg:px-8">
      <header className="pt-safe flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-[15px] font-semibold tracking-tight">
            {BRAND_NAME}
          </span>
        </Link>
        <Button asChild variant="secondary" size="sm">
          <Link href="/">
            <Icon name="ArrowLeft" /> Home
          </Link>
        </Button>
      </header>

      <main className="py-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated {updated}</p>
        <div className="mt-8 space-y-8">{children}</div>
        <SiteFooter />
        <div className="pb-10" />
      </main>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}
