import { verifyOwnerSession } from "@/lib/dal";
import { getJobs, getJobStats } from "@/lib/queries";
import { JobsView } from "./JobsView";

export const metadata = { title: "Jobs — Arashi OPS" };

export default async function JobsPage() {
  await verifyOwnerSession();
  const [jobs, stats] = await Promise.all([getJobs(), getJobStats()]);
  return <JobsView jobs={jobs} stats={stats} />;
}
