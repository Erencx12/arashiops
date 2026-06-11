import { verifyOwnerSession } from "@/lib/dal";
import { getSops } from "@/lib/queries";
import { SopsView } from "./SopsView";

export const metadata = { title: "SOPs — Arashi OPS" };

export default async function SopsPage() {
  await verifyOwnerSession();
  const sops = await getSops(true);
  return <SopsView sops={sops} />;
}
