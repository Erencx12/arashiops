import { notFound } from "next/navigation";
import { verifyOwnerSession } from "@/lib/dal";
import { getInvoiceById } from "@/lib/queries";
import { InvoicePrint } from "./InvoicePrint";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyOwnerSession();
  const { id } = await params;
  const invoice = await getInvoiceById(Number(id));
  if (!invoice) notFound();
  return <InvoicePrint invoice={invoice} />;
}
