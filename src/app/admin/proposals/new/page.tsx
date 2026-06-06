import { verifyOwnerSession } from "@/lib/dal";
import { getClients, getDeals } from "@/lib/queries";
import { ProposalForm } from "./ProposalForm";

export const metadata = { title: "New Proposal — Arashi OPS" };

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ dealId?: string }>;
}) {
  await verifyOwnerSession();
  const [clients, deals, params] = await Promise.all([getClients(), getDeals(), searchParams]);
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[20px] font-bold tracking-tight text-[#111111] mb-6">New Proposal</h1>
      <ProposalForm clients={clients} deals={deals} defaultDealId={params.dealId} />
    </div>
  );
}
