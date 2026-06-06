import { verifyClientSession } from "@/lib/dal";
import { getApprovalsByClient } from "@/lib/queries";
import { ClientApprovalsManager } from "@/components/client/ClientApprovalsManager";

export const metadata = { title: "Approvals" };

export default async function ClientApprovalsPage() {
  const session = await verifyClientSession();
  const approvals = await getApprovalsByClient(session.clientId);
  return <ClientApprovalsManager approvals={approvals} />;
}
