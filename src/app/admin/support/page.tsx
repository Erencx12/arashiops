import { verifyOwnerSession } from "@/lib/dal";
import { getSupportTickets, getClients } from "@/lib/queries";
import { SupportView } from "./SupportView";

export const metadata = { title: "Support — Arashi OPS" };

export default async function SupportPage() {
  await verifyOwnerSession();
  const [tickets, clients] = await Promise.all([
    getSupportTickets(),
    getClients(),
  ]);
  return <SupportView tickets={tickets} clients={clients} />;
}
