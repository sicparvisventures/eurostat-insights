import { BottomTabBar } from "@/components/shell/bottom-tab-bar";
import { PageTransition } from "@/components/shell/page-transition";
import { SplashScreen } from "@/components/shell/splash-screen";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <SplashScreen />
      <main className="flex-1 pb-28">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomTabBar />
    </div>
  );
}
