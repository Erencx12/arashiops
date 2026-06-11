import { verifyOwnerSession } from "@/lib/dal";
import { getResearchReports } from "@/lib/queries";
import { ResearchView } from "./ResearchView";

export const metadata = { title: "Research — Arashi OPS" };

export default async function ResearchPage() {
  await verifyOwnerSession();
  const reports = await getResearchReports(50);
  return <ResearchView reports={reports} />;
}
