import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { verifyOwnerSession } from "@/lib/dal";
import { getApprovals } from "@/lib/queries";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, approvals] = await Promise.all([
    verifyOwnerSession(),
    getApprovals(),
  ]);
  const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
  return (
    <DashboardShell role="owner" userName={session.name} userSub="Owner" pendingApprovals={pendingApprovals}>
      {children}
    </DashboardShell>
  );
}
