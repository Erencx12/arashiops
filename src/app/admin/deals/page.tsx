import { verifyOwnerSession } from "@/lib/dal";
import { getDeals } from "@/lib/queries";
import { DealsBoard } from "./DealsBoard";

export const metadata = { title: "Deals Pipeline — Arashi OPS" };

export default async function DealsPage() {
  await verifyOwnerSession();
  const deals = await getDeals();
  return <DealsBoard deals={deals} />;
}
