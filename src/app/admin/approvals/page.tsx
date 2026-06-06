import { getApprovals } from "@/lib/queries";
import { ApprovalsManager } from "@/components/dashboard/ApprovalsManager";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const approvals = await getApprovals();
  return <ApprovalsManager approvals={approvals} />;
}
