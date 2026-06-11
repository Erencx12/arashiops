import { verifyOwnerSession } from "@/lib/dal";
import { getApolloLeads, getLeadScores, getLeadScoreStats } from "@/lib/queries";
import { LeadsAIView } from "./LeadsAIView";

export const metadata = { title: "Lead Scoring — Arashi OPS" };

export default async function LeadsAIPage() {
  await verifyOwnerSession();
  const [leads, scores, stats] = await Promise.all([
    getApolloLeads(undefined, 200),
    getLeadScores(500),
    getLeadScoreStats(),
  ]);
  return <LeadsAIView leads={leads} scores={scores} stats={stats} />;
}
