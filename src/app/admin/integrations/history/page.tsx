import { verifyOwnerSession } from "@/lib/dal";
import { getSyncHistory, getSyncStats, getIntegrations } from "@/lib/queries";
import { HistoryView } from "./HistoryView";

export const metadata = { title: "Sync History — Arashi OPS" };

export default async function SyncHistoryPage() {
  await verifyOwnerSession();
  const [history, stats, integrations] = await Promise.all([
    getSyncHistory(undefined, 200),
    getSyncStats(),
    getIntegrations(),
  ]);
  return <HistoryView history={history} stats={stats} integrations={integrations} />;
}
