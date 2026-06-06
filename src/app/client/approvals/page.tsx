import { getClientByName, getApprovalsByClient } from "@/lib/queries";
import { ClientApprovalsManager } from "@/components/client/ClientApprovalsManager";

export const metadata = { title: "Approvals" };

const DEMO_CLIENT = "Relay Software";

export default async function ClientApprovalsPage() {
  const client = await getClientByName(DEMO_CLIENT);
  if (!client) return <div className="px-8 py-8 text-[13px] text-[#9ca3af]">Client not found.</div>;

  const approvals = await getApprovalsByClient(client.id);
  return <ClientApprovalsManager approvals={approvals} />;
}
