import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { verifyOwnerSession } from "@/lib/dal";
import { getDealById, getDiscoveryCallsByDeal, getProposalsByDeal } from "@/lib/queries";
import { DealDetail } from "./DealDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDealById(Number(id));
  return { title: deal ? `${deal.company} — Arashi OPS` : "Deal" };
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyOwnerSession();
  const { id } = await params;
  const dealId = Number(id);

  const deal = await getDealById(dealId);
  if (!deal) notFound();

  const [calls, proposals] = await Promise.all([
    getDiscoveryCallsByDeal(dealId),
    getProposalsByDeal(dealId),
  ]);

  return (
    <div className="px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/deals" className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">{deal.company}</h1>
          <p className="text-[12.5px] text-[#9ca3af] mt-0.5">{deal.contact_name} {deal.contact_email ? `· ${deal.contact_email}` : ""}</p>
        </div>
        <Badge label={deal.stage} />
      </div>

      <DealDetail deal={deal} calls={calls} proposals={proposals} />
    </div>
  );
}
