import { verifyClientSession } from "@/lib/dal";
import { getClientById, getOnboardingProgress, getOnboardingForm } from "@/lib/queries";
import { OnboardingView } from "./OnboardingView";

export const metadata = { title: "Onboarding — Arashi OPS" };

const STEPS = [
  { key: "profile_setup",          label: "Account Set Up",           desc: "Your client portal account has been created." },
  { key: "business_information",   label: "Business Information",      desc: "Tell us about your company and industry." },
  { key: "icp_information",        label: "Ideal Customer Profile",    desc: "Describe your target customer and market." },
  { key: "sales_information",      label: "Sales & Process Details",   desc: "Share your current sales approach and CRM." },
  { key: "requirements_submitted", label: "Questionnaire Submitted",   desc: "Complete the onboarding questionnaire below." },
  { key: "kickoff_scheduled",      label: "Kickoff Call Scheduled",    desc: "Your team will schedule the kickoff within 48h." },
] as const;

export default async function ClientOnboardingPage() {
  const session = await verifyClientSession();
  const [client, progress, form] = await Promise.all([
    getClientById(session.clientId),
    getOnboardingProgress(session.clientId),
    getOnboardingForm(session.clientId),
  ]);

  if (!client) {
    return (
      <div className="px-8 py-8">
        <p className="text-[13px] text-[#9ca3af]">Client record not found.</p>
      </div>
    );
  }

  const completedCount = progress
    ? STEPS.filter((s) => progress[s.key as keyof typeof progress]).length
    : 0;

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Onboarding</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">
          Complete each step so we can kick off your engagement.
        </p>
      </div>

      {/* Progress bar */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-[#111111]">
            {completedCount === STEPS.length ? "Onboarding Complete" : "Onboarding Progress"}
          </p>
          <p className="text-[13px] font-bold text-[#111111]">
            {completedCount}/{STEPS.length}
          </p>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#111111] rounded-full transition-all"
            style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {STEPS.map((step, i) => {
            const done = progress ? Boolean(progress[step.key as keyof typeof progress]) : false;
            return (
              <div key={step.key} className="text-center">
                <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold mb-1 ${
                  done ? "bg-[#111111] text-white" : "bg-[#f3f4f6] text-[#9ca3af]"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <p className="text-[9px] text-[#9ca3af] leading-tight hidden sm:block">{step.label.split(" ")[0]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step list */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-[#f3f4f6]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Steps</p>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {STEPS.map((step, i) => {
            const done = progress ? Boolean(progress[step.key as keyof typeof progress]) : false;
            return (
              <div key={step.key} className="flex items-start gap-4 px-5 py-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                  done ? "bg-[#111111] text-white" : "bg-[#f3f4f6] text-[#9ca3af]"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium ${done ? "text-[#9ca3af] line-through" : "text-[#111111]"}`}>{step.label}</p>
                  <p className="text-[12px] text-[#9ca3af] mt-0.5">{step.desc}</p>
                </div>
                {done && (
                  <span className="text-[11px] text-emerald-600 font-medium shrink-0">Done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Questionnaire */}
      <OnboardingView
        clientId={client.id}
        alreadySubmitted={Boolean(form)}
        existingForm={form}
        requirementsSubmitted={progress?.requirements_submitted ?? false}
      />
    </div>
  );
}
