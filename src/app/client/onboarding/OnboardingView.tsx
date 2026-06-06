"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitOnboardingForm } from "@/lib/onboarding-actions";
import type { DbOnboardingForm } from "@/lib/db-types";

type Props = {
  clientId: number;
  alreadySubmitted: boolean;
  existingForm: DbOnboardingForm | null;
  requirementsSubmitted: boolean;
};

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";

export function OnboardingView({ alreadySubmitted, existingForm, requirementsSubmitted }: Props) {
  const [state, action, pending] = useActionState(submitOnboardingForm, null);

  if (requirementsSubmitted || state?.success) {
    return (
      <div className="border border-emerald-100 rounded-xl bg-emerald-50 p-6 flex items-start gap-4">
        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] font-semibold text-emerald-900">Questionnaire submitted</p>
          <p className="text-[13px] text-emerald-700 mt-1 leading-relaxed">
            We&apos;ve received your information. Your team will review it and schedule your kickoff call within 48 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#e5e7eb] rounded-xl bg-white p-6">
      <div className="mb-5">
        <p className="text-[14px] font-semibold text-[#111111]">Onboarding Questionnaire</p>
        <p className="text-[12.5px] text-[#9ca3af] mt-0.5">Required fields are marked *</p>
      </div>

      <form action={action} className="space-y-5">
        {state?.error && (
          <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
            {state.error}
          </p>
        )}

        {/* Section: Company */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Company</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Legal Company Name *</label>
              <input
                name="company_name"
                required
                defaultValue={existingForm?.company_name ?? ""}
                placeholder="Acme Inc."
                className={inputCls}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Industry *</label>
              <input
                name="industry"
                required
                defaultValue={existingForm?.industry ?? ""}
                placeholder="B2B SaaS, E-commerce..."
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Company Website</label>
              <input
                name="website"
                type="url"
                defaultValue={existingForm?.website ?? ""}
                placeholder="https://yourcompany.com"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Section: Market & ICP */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Market & ICP</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Target Market *</label>
              <input
                name="target_market"
                required
                defaultValue={existingForm?.target_market ?? ""}
                placeholder="Mid-market SaaS companies in North America"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Ideal Customer Profile *</label>
              <textarea
                name="ideal_customer_profile"
                required
                defaultValue={existingForm?.ideal_customer_profile ?? ""}
                rows={3}
                placeholder="Describe your ideal customer: company size, role, pain points, buying triggers..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Section: Sales */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Sales & Process</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Average Deal Size</label>
              <input
                name="average_deal_size"
                defaultValue={existingForm?.average_deal_size ?? ""}
                placeholder="$5,000 — $50,000"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Sales Team Size</label>
              <input
                name="sales_team_size"
                defaultValue={existingForm?.sales_team_size ?? ""}
                placeholder="e.g. 3 AEs, 2 SDRs"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Current CRM</label>
              <input
                name="current_crm"
                defaultValue={existingForm?.current_crm ?? ""}
                placeholder="HubSpot, Salesforce, None..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Monthly Revenue Range</label>
              <select
                name="monthly_revenue_range"
                defaultValue={existingForm?.monthly_revenue_range ?? ""}
                className={`${inputCls} bg-white`}
              >
                <option value="">Select range</option>
                <option>Under $10K</option>
                <option>$10K — $50K</option>
                <option>$50K — $200K</option>
                <option>$200K — $1M</option>
                <option>Over $1M</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Current Outreach Process</label>
              <textarea
                name="current_outreach_process"
                defaultValue={existingForm?.current_outreach_process ?? ""}
                rows={2}
                placeholder="How do you currently generate and work leads? Cold email, referrals, inbound..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Section: Goals */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Goals & Challenges</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Business Goals *</label>
              <textarea
                name="business_goals"
                required
                defaultValue={existingForm?.business_goals ?? ""}
                rows={3}
                placeholder="What are you trying to achieve in the next 6–12 months? Revenue targets, market expansion, pipeline goals..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Primary Challenges *</label>
              <textarea
                name="primary_challenges"
                required
                defaultValue={existingForm?.primary_challenges ?? ""}
                rows={3}
                placeholder="What are your biggest obstacles right now? Where do deals stall, what's slowing growth..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Additional Notes</label>
              <textarea
                name="additional_notes"
                defaultValue={existingForm?.additional_notes ?? ""}
                rows={2}
                placeholder="Anything else we should know before kicking off?"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
          >
            {pending ? "Submitting…" : alreadySubmitted ? "Resubmit Questionnaire" : "Submit Questionnaire"}
          </button>
        </div>
      </form>
    </div>
  );
}
