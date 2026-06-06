import { getProjects } from "@/lib/queries";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsTable projects={projects} />;
}
