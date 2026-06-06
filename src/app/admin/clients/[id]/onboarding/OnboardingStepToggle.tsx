"use client";

import { useTransition } from "react";
import { updateOnboardingStepAction } from "@/lib/onboarding-actions";

type Step = "profile_setup" | "business_information" | "icp_information" | "sales_information" | "requirements_submitted" | "kickoff_scheduled";

export function OnboardingStepToggle({
  clientId,
  step,
  checked,
}: {
  clientId: number;
  step: Step;
  checked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await updateOnboardingStepAction(clientId, step, !checked); })}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        checked ? "bg-[#111111]" : "bg-[#e5e7eb]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
