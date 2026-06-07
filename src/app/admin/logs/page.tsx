import { verifyOwnerSession } from "@/lib/dal";
import { getSystemLogs, getLogStats } from "@/lib/queries";
import { LogsView } from "./LogsView";

export const metadata = { title: "Logs — Arashi OPS" };

export default async function LogsPage() {
  await verifyOwnerSession();
  const [logs, stats] = await Promise.all([getSystemLogs(), getLogStats()]);
  return <LogsView logs={logs} stats={stats} />;
}
