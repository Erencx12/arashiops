import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { verifyClientSession } from "@/lib/dal";
import { getClientById } from "@/lib/queries";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyClientSession();
  const client = await getClientById(session.clientId);
  const userName = client?.company_name ?? session.name;
  const userSub = client ? `${client.tier} Plan` : "Client";

  return (
    <DashboardShell role="client" userName={userName} userSub={userSub} userTier={client?.tier ?? undefined}>
      {children}
    </DashboardShell>
  );
}
