import { verifyOwnerSession } from "@/lib/dal";
import { getInvoicesEnhanced, getClients } from "@/lib/queries";
import { InvoicesView } from "./InvoicesView";

export const metadata = { title: "Invoices — Arashi OPS" };

export default async function InvoicesPage() {
  await verifyOwnerSession();
  const [invoices, clients] = await Promise.all([getInvoicesEnhanced(), getClients()]);
  return <InvoicesView invoices={invoices} clients={clients} />;
}
