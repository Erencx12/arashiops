import { verifyOwnerSession } from "@/lib/dal";
import { getAiJobs, getAiUsageTotals, getLeadScoreStats, getAiInsights, getResearchReports } from "@/lib/queries";
import { isApiKeyConfigured } from "@/lib/claude";
import { AIHubView } from "./AIHubView";

export const metadata = { title: "AI Hub — Arashi OPS" };

export default async function AIHubPage() {
  await verifyOwnerSession();
  const [jobs, usageTotals, leadStats, recentInsights, recentReports] = await Promise.all([
    getAiJobs(20),
    getAiUsageTotals(),
    getLeadScoreStats(),
    getAiInsights(undefined, 5),
    getResearchReports(5),
  ]);
  const apiConfigured = isApiKeyConfigured();
  return (
    <AIHubView
      jobs={jobs}
      usageTotals={usageTotals}
      leadStats={leadStats}
      recentInsights={recentInsights}
      recentReports={recentReports}
      apiConfigured={apiConfigured}
    />
  );
}
