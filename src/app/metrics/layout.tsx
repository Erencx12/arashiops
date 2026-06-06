import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { verifyOwnerSession } from "@/lib/dal";

export default async function MetricsLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyOwnerSession();
  return (
    <DashboardShell role="owner" userName={session.name} userSub="Owner">
      {children}
    </DashboardShell>
  );
}
