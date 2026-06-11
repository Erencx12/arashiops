import { verifyClientSession } from "@/lib/dal";
import { getClientById, getActiveSubscription } from "@/lib/queries";
import { SettingsView } from "./SettingsView";

export const metadata = { title: "Settings — Arashi OPS" };

export default async function ClientSettingsPage() {
  const session = await verifyClientSession();
  const [client, subscription] = await Promise.all([
    getClientById(session.clientId),
    getActiveSubscription(session.clientId),
  ]);

  if (!client) return null;

  return <SettingsView client={client} subscription={subscription} />;
}
