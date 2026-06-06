import { getClientByName, getLeadsByClient } from "@/lib/queries";
import { LeadsTable } from "@/components/client/LeadsTable";

export const metadata = { title: "Lead Tracker" };

const DEMO_CLIENT = "Relay Software";

export default async function LeadsPage() {
  const client = await getClientByName(DEMO_CLIENT);
  if (!client) return <div className="px-8 py-8 text-[13px] text-[#9ca3af]">Client not found.</div>;

  const leads = await getLeadsByClient(client.id);
  return <LeadsTable leads={leads} />;
}
