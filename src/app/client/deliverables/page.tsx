import { verifyClientSession } from "@/lib/dal";
import { getContentItemsByClient } from "@/lib/queries";
import { DeliverablesTable } from "@/components/client/DeliverablesTable";

export const metadata = { title: "Deliverables" };

export default async function DeliverablesPage() {
  const session = await verifyClientSession();
  const items = await getContentItemsByClient(session.clientId);
  return <DeliverablesTable items={items} />;
}
