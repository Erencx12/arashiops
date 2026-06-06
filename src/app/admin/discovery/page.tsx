import { verifyOwnerSession } from "@/lib/dal";
import { getDiscoveryCalls, getDeals } from "@/lib/queries";
import { DiscoveryView } from "./DiscoveryView";

export const metadata = { title: "Discovery Calls — Arashi OPS" };

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ dealId?: string }>;
}) {
  await verifyOwnerSession();
  const [calls, deals, params] = await Promise.all([
    getDiscoveryCalls(),
    getDeals(),
    searchParams,
  ]);
  return <DiscoveryView calls={calls} deals={deals} defaultDealId={params.dealId} />;
}
