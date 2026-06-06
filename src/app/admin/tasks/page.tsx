import { verifyOwnerSession } from "@/lib/dal";
import { getTasks, getClients, getProjects } from "@/lib/queries";
import { TasksView } from "./TasksView";

export const metadata = { title: "Tasks — Arashi OPS" };

export default async function TasksPage() {
  await verifyOwnerSession();

  const [tasks, clients, projects] = await Promise.all([
    getTasks(),
    getClients(),
    getProjects(),
  ]);

  return <TasksView tasks={tasks} clients={clients} projects={projects} />;
}
