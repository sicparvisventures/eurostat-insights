import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-5 px-6 text-center">
      <Logo size={64} />
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        <Icon name="WifiOff" className="size-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">You&apos;re offline</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Eurostat Insights needs a connection to load fresh data. Previously
          viewed charts remain available.
        </p>
      </div>
      <Button asChild>
        <Link href="/home">
          <Icon name="RefreshCw" /> Try again
        </Link>
      </Button>
    </div>
  );
}
