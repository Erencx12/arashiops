import { verifyClientSession } from "@/lib/dal";
import { getLeadsByClient } from "@/lib/queries";
import { LeadsTable } from "@/components/client/LeadsTable";

export const metadata = { title: "Lead Tracker" };

export default async function LeadsPage() {
  const session = await verifyClientSession();
  const leads = await getLeadsByClient(session.clientId);
  return <LeadsTable leads={leads} />;
}
