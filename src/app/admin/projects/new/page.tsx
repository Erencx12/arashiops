import { verifyOwnerSession } from "@/lib/dal";
import { getClients } from "@/lib/queries";
import { NewProjectForm } from "./NewProjectForm";

export const metadata = { title: "New Project — Arashi OPS" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await verifyOwnerSession();
  const [clients, params] = await Promise.all([getClients(), searchParams]);
  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[20px] font-bold tracking-tight text-[#111111] mb-6">New Project</h1>
      <NewProjectForm clients={clients} defaultClientId={params.clientId} />
    </div>
  );
}
