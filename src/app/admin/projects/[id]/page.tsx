import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { verifyOwnerSession } from "@/lib/dal";
import { getProjectById, getMilestonesByProject, getTasksByProject, getContentItemsByClient } from "@/lib/queries";
import { ProjectDetail } from "./ProjectDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(Number(id));
  return { title: project ? `${project.title} — Arashi OPS` : "Project" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyOwnerSession();
  const { id } = await params;
  const projectId = Number(id);

  const project = await getProjectById(projectId);
  if (!project) notFound();

  const [milestones, tasks, deliverables] = await Promise.all([
    getMilestonesByProject(projectId),
    getTasksByProject(projectId),
    getContentItemsByClient(project.client_id),
  ]);

  const projectDeliverables = deliverables.filter((d) => d.project_id === projectId);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/projects" className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">{project.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Link href={`/admin/clients/${project.client_id}`} className="text-[12.5px] text-[#6b7280] hover:text-[#111111] transition-colors">
              {project.client_name}
            </Link>
            <span className="text-[#e5e7eb]">·</span>
            <span className="text-[12.5px] text-[#9ca3af]">Due {project.deadline}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={project.priority} />
          <Badge label={project.status} />
        </div>
      </div>

      {/* Progress */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white p-5 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[13px] font-semibold text-[#111111]">Progress</p>
          <p className="text-[13px] font-bold text-[#111111]">{project.progress}%</p>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div className="h-full bg-[#111111] rounded-full transition-all" style={{ width: `${project.progress}%` }} />
        </div>
        {project.description && (
          <p className="text-[13px] text-[#6b7280] mt-4 leading-relaxed">{project.description}</p>
        )}
      </div>

      <ProjectDetail
        project={project}
        milestones={milestones}
        tasks={tasks}
        deliverables={projectDeliverables}
      />
    </div>
  );
}
