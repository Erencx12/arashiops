import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { verifyOwnerSession } from "@/lib/dal";
import { getProposalById } from "@/lib/queries";
import { ProposalDetail } from "./ProposalDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProposalById(Number(id));
  return { title: p ? `${p.title} — Arashi OPS` : "Proposal" };
}

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyOwnerSession();
  const { id } = await params;
  const proposal = await getProposalById(Number(id));
  if (!proposal) notFound();

  return (
    <div className="px-8 py-8">
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Link href="/admin/proposals" className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">{proposal.title}</h1>
          <p className="text-[12.5px] text-[#9ca3af] mt-0.5">
            {proposal.deal_company ?? proposal.client_name ?? "No deal linked"} · v{proposal.version}
          </p>
        </div>
        <Badge label={proposal.status} />
      </div>
      <ProposalDetail proposal={proposal} />
    </div>
  );
}
