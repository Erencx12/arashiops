import { verifyOwnerSession } from "@/lib/dal";
import { getAiPrompts } from "@/lib/queries";
import { PromptsView } from "./PromptsView";

export const metadata = { title: "AI Prompts — Arashi OPS" };

export default async function PromptsPage() {
  await verifyOwnerSession();
  const prompts = await getAiPrompts();
  return <PromptsView prompts={prompts} />;
}
