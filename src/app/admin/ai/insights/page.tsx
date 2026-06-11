import { verifyOwnerSession } from "@/lib/dal";
import { getAiInsights, getInstantlyCampaigns, getClients, getLeadScoreStats } from "@/lib/queries";
import { InsightsView } from "./InsightsView";

export const metadata = { title: "Insights — Arashi OPS" };

export default async function InsightsPage() {
  await verifyOwnerSession();
  const [insights, campaigns, clients, leadStats] = await Promise.all([
    getAiInsights(undefined, 50),
    getInstantlyCampaigns(),
    getClients(),
    getLeadScoreStats(),
  ]);
  return <InsightsView insights={insights} campaigns={campaigns} clients={clients} leadStats={leadStats} />;
}
