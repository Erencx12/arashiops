import { getClients } from "@/lib/queries";
import { ClientsTable } from "@/components/dashboard/ClientsTable";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const clients = await getClients();
  return <ClientsTable clients={clients} />;
}
