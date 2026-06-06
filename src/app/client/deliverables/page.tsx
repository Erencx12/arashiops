import { getClientByName, getContentItemsByClient } from "@/lib/queries";
import { DeliverablesTable } from "@/components/client/DeliverablesTable";

export const metadata = { title: "Deliverables" };

const DEMO_CLIENT = "Relay Software";

export default async function DeliverablesPage() {
  const client = await getClientByName(DEMO_CLIENT);
  if (!client) return <div className="px-8 py-8 text-[13px] text-[#9ca3af]">Client not found.</div>;

  const items = await getContentItemsByClient(client.id);
  return <DeliverablesTable items={items} />;
}
