import { verifyClientSession } from "@/lib/dal";
import { getContentItemsByClient } from "@/lib/queries";
import { FilesView } from "./FilesView";

export const metadata = { title: "Files Vault — Arashi OPS" };

export default async function FilesPage() {
  const session = await verifyClientSession();
  const items = await getContentItemsByClient(session.clientId);
  return <FilesView items={items} />;
}
