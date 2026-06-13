import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { verifyOwnerSession } from "@/lib/dal";
import { getApprovals, getUpcomingMeetingsCount } from "@/lib/queries";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, approvals, upcomingMeetings] = await Promise.all([
    verifyOwnerSession(),
    getApprovals(),
    getUpcomingMeetingsCount(),
  ]);
  const pendingApprovals = approvals.filter((a) => a.status === "Pending").length;
  return (
    <DashboardShell
      role="owner"
      userName={session.name}
      userSub="Owner"
      pendingApprovals={pendingApprovals}
      upcomingMeetings={upcomingMeetings}
    >
      {children}
    </DashboardShell>
  );
}
