import { AppShell } from "@/components/shell/app-shell";
import { BUSINESS_TABS } from "@/components/shell/nav-tabs";

export default function BusinessAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell tabs={BUSINESS_TABS} brandHref="/business/home" splash={false}>
      {children}
    </AppShell>
  );
}
