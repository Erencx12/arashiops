import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { verifyOwnerSession } from "@/lib/dal";
import { getProposals } from "@/lib/queries";
import { ProposalsView } from "./ProposalsView";

export const metadata = { title: "Proposals — Arashi OPS" };

export default async function ProposalsPage() {
  await verifyOwnerSession();
  const proposals = await getProposals();
  return <ProposalsView proposals={proposals} />;
}
