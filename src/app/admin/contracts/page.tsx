import { verifyOwnerSession } from "@/lib/dal";
import { getContractsEnhanced, getClients } from "@/lib/queries";
import { ContractsView } from "./ContractsView";

export const metadata = { title: "Contracts — Arashi OPS" };

export default async function ContractsPage() {
  await verifyOwnerSession();
  const [contracts, clients] = await Promise.all([getContractsEnhanced(), getClients()]);
  return <ContractsView contracts={contracts} clients={clients} />;
}
