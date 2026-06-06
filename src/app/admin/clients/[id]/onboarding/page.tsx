import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { verifyOwnerSession } from "@/lib/dal";
import { getClientById, getOnboardingProgress, getOnboardingForm, upsertOnboardingProgress } from "@/lib/queries";
import { OnboardingStepToggle } from "./OnboardingStepToggle";

const STEPS = [
  { key: "profile_setup" as const,          label: "Profile Setup",          desc: "Client account created and portal access granted." },
  { key: "business_information" as const,   label: "Business Information",    desc: "Basic company and contact details collected." },
  { key: "icp_information" as const,        label: "ICP Information",         desc: "Ideal customer profile and target market defined." },
  { key: "sales_information" as const,      label: "Sales Information",       desc: "Team size, CRM, and outreach process documented." },
  { key: "requirements_submitted" as const, label: "Requirements Submitted",  desc: "Client has completed the onboarding questionnaire." },
  { key: "kickoff_scheduled" as const,      label: "Kickoff Scheduled",       desc: "Strategy call booked and confirmed." },
];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(Number(id));
  return { title: client ? `Onboarding — ${client.company_name}` : "Onboarding" };
}

export default async function ClientOnboardingPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyOwnerSession();
  const { id } = await params;
  const clientId = Number(id);

  const [client, rawProgress, form] = await Promise.all([
    getClientById(clientId),
    getOnboardingProgress(clientId),
    getOnboardingForm(clientId),
  ]);

  if (!client) notFound();

  // Auto-init if never set up
  const progress = rawProgress ?? await upsertOnboardingProgress(clientId);

  const completedSteps = STEPS.filter((s) => progress[s.key]).length;
  const pct = Math.round((completedSteps / STEPS.length) * 100);

  return (
    <div className="px-8 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/clients/${clientId}`} className="p-1.5 rounded-md text-[#9ca3af] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Onboarding</h1>
          <p className="text-[12.5px] text-[#9ca3af]">{client.company_name}</p>
        </div>
        <Badge label={progress.status} />
      </div>

      {/* Progress bar */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-[#111111]">Overall Progress</p>
          <p className="text-[13px] font-bold text-[#111111]">{completedSteps}/{STEPS.length} steps · {pct}%</p>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#111111] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#e5e7eb]">
          <p className="text-[13px] font-semibold text-[#111111]">Onboarding Steps</p>
          <p className="text-[12px] text-[#9ca3af] mt-0.5">Toggle steps as they're completed. Status updates automatically.</p>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-start gap-4 px-5 py-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                progress[step.key] ? "bg-[#111111]" : "bg-[#f3f4f6] border border-[#e5e7eb]"
              }`}>
                {progress[step.key]
                  ? <Check size={12} strokeWidth={2.5} className="text-white" />
                  : <span className="text-[10px] font-semibold text-[#9ca3af]">{i + 1}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] font-medium ${progress[step.key] ? "text-[#111111]" : "text-[#374151]"}`}>
                  {step.label}
                </p>
                <p className="text-[12px] text-[#9ca3af] mt-0.5">{step.desc}</p>
              </div>
              <OnboardingStepToggle
                clientId={clientId}
                step={step.key}
                checked={progress[step.key]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Questionnaire responses */}
      {form && form.submitted_at ? (
        <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#111111]">Questionnaire Responses</p>
            <span className="text-[11.5px] text-[#9ca3af] flex items-center gap-1">
              <Check size={11} className="text-emerald-500" /> Submitted
            </span>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            {[
              { label: "Company Name", value: form.company_name },
              { label: "Industry", value: form.industry },
              { label: "Website", value: form.website },
              { label: "Target Market", value: form.target_market },
              { label: "Ideal Customer Profile", value: form.ideal_customer_profile },
              { label: "Average Deal Size", value: form.average_deal_size },
              { label: "Current CRM", value: form.current_crm },
              { label: "Sales Team Size", value: form.sales_team_size },
              { label: "Current Outreach Process", value: form.current_outreach_process },
              { label: "Business Goals", value: form.business_goals },
              { label: "Monthly Revenue Range", value: form.monthly_revenue_range },
              { label: "Primary Challenges", value: form.primary_challenges },
              { label: "Additional Notes", value: form.additional_notes },
            ].filter((r) => r.value).map((row) => (
              <div key={row.label} className="px-5 py-3.5 flex items-start gap-4">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9ca3af] w-44 shrink-0 pt-0.5">{row.label}</p>
                <p className="text-[13px] text-[#374151] leading-relaxed">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-[#e5e7eb] rounded-xl bg-white px-5 py-8 text-center">
          <Clock size={18} className="text-[#d1d5db] mx-auto mb-2" />
          <p className="text-[13px] text-[#9ca3af]">Questionnaire not yet submitted by client.</p>
          <p className="text-[12px] text-[#9ca3af] mt-1">The client will complete this from their portal.</p>
        </div>
      )}
    </div>
  );
}
