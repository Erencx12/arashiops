"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "./dal";
import { verifyClientSession } from "./dal";
import {
  upsertOnboardingProgress,
  updateOnboardingStep,
  updateOnboardingStatus,
  upsertOnboardingForm,
  getOnboardingProgress,
  createNotification,
} from "./queries";
import { sql } from "./db";

// ─── Submit onboarding questionnaire (client action) ─────────────────────────

const OnboardingFormSchema = z.object({
  company_name:             z.string().min(1),
  industry:                 z.string().min(1),
  website:                  z.string().optional(),
  target_market:            z.string().min(1),
  ideal_customer_profile:   z.string().min(1),
  average_deal_size:        z.string().optional(),
  current_crm:              z.string().optional(),
  sales_team_size:          z.string().optional(),
  current_outreach_process: z.string().optional(),
  business_goals:           z.string().min(1),
  monthly_revenue_range:    z.string().optional(),
  primary_challenges:       z.string().min(1),
  additional_notes:         z.string().optional(),
});

export type OnboardingFormState = {
  error?: string;
  success?: boolean;
} | null;

export async function submitOnboardingForm(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  try {
    const session = await verifyClientSession();

    const raw = Object.fromEntries(
      Object.keys(OnboardingFormSchema.shape).map((k) => [k, formData.get(k)])
    );
    const parsed = OnboardingFormSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Please fill in all required fields." };
    }

    await upsertOnboardingForm(session.clientId, {
      ...parsed.data,
      submitted_at: new Date().toISOString(),
    });

    // Update progress steps
    await upsertOnboardingProgress(session.clientId);
    await updateOnboardingStep(session.clientId, "requirements_submitted", true);
    await updateOnboardingStep(session.clientId, "business_information", true);
    await updateOnboardingStep(session.clientId, "icp_information", true);
    await updateOnboardingStep(session.clientId, "sales_information", true);
    await updateOnboardingStatus(session.clientId, "Waiting For Client");

    await sql`
      INSERT INTO activity_log (type, description)
      VALUES ('onboarding', ${`Onboarding questionnaire submitted for client #${session.clientId}`})
    `;

    revalidatePath("/client/onboarding");
    revalidatePath(`/admin/clients/${session.clientId}/onboarding`);
    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// ─── Update onboarding step (owner action) ───────────────────────────────────

export async function updateOnboardingStepAction(
  clientId: number,
  step: "profile_setup" | "business_information" | "icp_information" | "sales_information" | "requirements_submitted" | "kickoff_scheduled",
  value: boolean
): Promise<{ ok: boolean }> {
  try {
    const session = await verifySession();
    if (session.role !== "owner") return { ok: false };

    await upsertOnboardingProgress(clientId);
    await updateOnboardingStep(clientId, step, value);

    // Auto-complete if all steps are done
    const progress = await getOnboardingProgress(clientId);
    if (
      progress &&
      progress.profile_setup &&
      progress.business_information &&
      progress.icp_information &&
      progress.sales_information &&
      progress.requirements_submitted &&
      progress.kickoff_scheduled
    ) {
      await updateOnboardingStatus(clientId, "Completed");
      await createNotification({
        type: "onboarding_completed",
        title: "Onboarding Completed",
        message: `Client #${clientId} has completed onboarding.`,
        clientId,
      });
    }

    revalidatePath(`/admin/clients/${clientId}/onboarding`);
    revalidatePath(`/admin/clients/${clientId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ─── Mark profile setup complete (fires when client account activated) ────────

export async function initOnboarding(clientId: number): Promise<void> {
  await upsertOnboardingProgress(clientId);
  await updateOnboardingStep(clientId, "profile_setup", true);
  await updateOnboardingStatus(clientId, "In Progress");
}
