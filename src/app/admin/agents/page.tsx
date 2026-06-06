import { getAgentTasks } from "@/lib/queries";
import { AgentsView } from "@/components/dashboard/AgentsView";

export const metadata = { title: "Agent Workflows" };

export default async function AgentsPage() {
  const tasks = await getAgentTasks();
  return <AgentsView tasks={tasks} />;
}
