import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { verifySession } from "@/lib/dal";
import { getClientById } from "@/lib/queries";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  if (session.role === "owner") {
    return (
      <DashboardShell role="client" userName={session.name} userSub="Owner Preview">
        {children}
      </DashboardShell>
    );
  }

  const client = session.clientId ? await getClientById(session.clientId) : null;
  const userName = client?.company_name ?? session.name;
  const userSub = client ? `${client.tier} Plan` : "Client";

  return (
    <DashboardShell role="client" userName={userName} userSub={userSub}>
      {children}
    </DashboardShell>
  );
}
