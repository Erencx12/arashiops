import { verifyOwnerSession } from "@/lib/dal";
import { getDocs } from "@/lib/queries";
import { DocsView } from "./DocsView";

export const metadata = { title: "Docs — Arashi OPS" };

export default async function DocsPage() {
  await verifyOwnerSession();
  const docs = await getDocs(true);
  return <DocsView docs={docs} />;
}
