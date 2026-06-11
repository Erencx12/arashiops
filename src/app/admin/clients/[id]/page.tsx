import Link from "next/link";
import { ArrowLeft, Building2, Calendar, DollarSign, Activity, ClipboardList } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { verifyOwnerSession } from "@/lib/dal";
import {
  getClientById, getProjectsByClient, getOnboardingProgress,
  getNotesByClient, getTasksByClient,
} from "@/lib/queries";
import { ClientDetail } from "./ClientDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await getClientById(Number(id));
    return { title: client ? `${client.company_name} — Arashi OPS` : "Client" };
  } catch {
    return { title: "Client" };
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyOwnerSession();
  const { id } = await params;
  const clientId = Number(id);

  let client, projects, onboarding, notes, tasks;
  try {
    [client, projects, onboarding, notes, tasks] = await Promise.all([
      getClientById(clientId),
      getProjectsByClient(clientId),
      getOnboardingProgress(clientId),
      getNotesByClient(clientId),
      getTasksByClient(clientId),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return (
      <div className="px-8 py-8">
        <div className="border border-red-200 rounded-xl p-6 bg-red-50">
          <p className="text-[14px] font-bold text-red-800 mb-2">DB Error loading client {clientId}</p>
          <pre className="text-[12px] text-red-600 whitespace-pre-wrap">{msg}</pre>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="px-8 py-8">
        <div className="border border-amber-200 rounded-xl p-6 bg-amber-50">
          <p className="text-[14px] font-bold text-amber-800">Client {clientId} not found in DB</p>
          <Link href="/admin/clients" className="text-[12.5px] text-blue-600 underline mt-2 block">← Back to clients</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/clients"
          className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
              <span className="text-[13px] font-bold text-white">{client.company_name[0]}</span>
            </div>
            <div>
              <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">
                {client.company_name}
              </h1>
              <p className="text-[12.5px] text-[#9ca3af]">{client.industry} · {client.owner}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={client.tier} />
          <Badge label={client.status} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: "Monthly Value", value: `$${client.monthly_value.toLocaleString()}` },
          { icon: Activity, label: "Health Score", value: `${client.health_score}/100` },
          { icon: Calendar, label: "Renewal", value: client.renewal_date || "—" },
          { icon: Building2, label: "Active Projects", value: String(projects.filter((p) => p.status === "Active").length) },
        ].map((s) => (
          <div key={s.label} className="border border-[#e5e7eb] rounded-xl bg-white px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <s.icon size={12} className="text-[#9ca3af]" />
              <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{s.label}</p>
            </div>
            <p className="text-[18px] font-bold text-[#111111] tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Onboarding CTA if no progress */}
      {!onboarding && (
        <div className="border border-amber-100 rounded-xl bg-amber-50 px-5 py-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList size={16} className="text-amber-600" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">Onboarding not started</p>
              <p className="text-[12px] text-amber-600">Initialize onboarding to begin tracking this client's setup progress.</p>
            </div>
          </div>
          <Link
            href={`/admin/clients/${clientId}/onboarding`}
            className="shrink-0 px-3.5 py-2 bg-amber-600 text-white text-[12.5px] font-medium rounded-md hover:bg-amber-700 transition-colors"
          >
            Start Onboarding
          </Link>
        </div>
      )}

      {onboarding && (
        <div className="border border-[#e5e7eb] rounded-xl bg-white px-5 py-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Onboarding</p>
            <div className="flex items-center gap-3">
              <Badge label={onboarding.status} />
              <div className="flex items-center gap-1.5">
                {(["profile_setup","business_information","icp_information","sales_information","requirements_submitted","kickoff_scheduled"] as const).map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${onboarding[step] ? "bg-[#111111]" : "bg-[#e5e7eb]"}`}
                    title={step.replace(/_/g, " ")}
                  />
                ))}
              </div>
              <span className="text-[12px] text-[#9ca3af]">
                {(["profile_setup","business_information","icp_information","sales_information","requirements_submitted","kickoff_scheduled"] as const).filter((s) => onboarding[s]).length}/6 steps
              </span>
            </div>
          </div>
          <Link
            href={`/admin/clients/${clientId}/onboarding`}
            className="text-[12.5px] text-[#6b7280] hover:text-[#111111] transition-colors"
          >
            Manage →
          </Link>
        </div>
      )}

      {/* Client Detail (interactive) */}
      <ClientDetail
        client={client}
        projects={projects}
        notes={notes}
        tasks={tasks}
        clientId={clientId}
      />
    </div>
  );
}
