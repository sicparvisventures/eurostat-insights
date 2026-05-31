import { BusinessTabBar } from "@/components/shell/business-tab-bar";
import { PageTransition } from "@/components/shell/page-transition";

export default function BusinessAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <main className="flex-1 pb-28">
        <PageTransition>{children}</PageTransition>
      </main>
      <BusinessTabBar />
    </div>
  );
}
