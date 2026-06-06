"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { createDeal, updateDealStage, updateDealFields, getDealById } from "./queries";
import { sql } from "./db";

const DealSchema = z.object({
  company:             z.string().min(1),
  contactName:         z.string().min(1),
  contactEmail:        z.string().email().optional().or(z.literal("")),
  dealValue:           z.coerce.number().min(0),
  stage:               z.string().min(1),
  owner:               z.string().min(1),
  expectedCloseDate:   z.string().optional(),
  notes:               z.string().optional(),
});

export type DealActionState = { error?: string; success?: boolean; dealId?: number } | null;

export async function createDealAction(
  _prev: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  try {
    await verifyOwnerSession();
    const raw = {
      company:           formData.get("company"),
      contactName:       formData.get("contactName"),
      contactEmail:      formData.get("contactEmail"),
      dealValue:         formData.get("dealValue"),
      stage:             formData.get("stage") ?? "Lead",
      owner:             formData.get("owner") ?? "Soham Das",
      expectedCloseDate: formData.get("expectedCloseDate"),
      notes:             formData.get("notes"),
    };
    const parsed = DealSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please fill in all required fields." };

    const deal = await createDeal({
      company:           parsed.data.company,
      contactName:       parsed.data.contactName,
      contactEmail:      parsed.data.contactEmail || null,
      dealValue:         parsed.data.dealValue,
      stage:             parsed.data.stage,
      owner:             parsed.data.owner,
      expectedCloseDate: parsed.data.expectedCloseDate || null,
      notes:             parsed.data.notes || null,
    });

    await sql`INSERT INTO activity_log (type, description) VALUES ('deal', ${`New deal created: ${deal.company}`})`;
    revalidatePath("/admin/deals");
    return { success: true, dealId: deal.id };
  } catch {
    return { error: "Something went wrong." };
  }
}

export async function updateDealStageAction(dealId: number, stage: string): Promise<void> {
  await verifyOwnerSession();
  await updateDealStage(dealId, stage);

  if (stage === "Won") {
    await sql`INSERT INTO activity_log (type, description) VALUES ('deal', ${`Deal won: ID #${dealId}`})`;
  } else if (stage === "Lost") {
    await sql`INSERT INTO activity_log (type, description) VALUES ('deal', ${`Deal lost: ID #${dealId}`})`;
  }

  revalidatePath("/admin/deals");
  revalidatePath(`/admin/deals/${dealId}`);
}

export async function updateDealFieldsAction(
  dealId: number,
  _prev: DealActionState,
  formData: FormData
): Promise<DealActionState> {
  try {
    await verifyOwnerSession();
    await updateDealFields(dealId, {
      company:           formData.get("company") as string || undefined,
      contactName:       formData.get("contactName") as string || undefined,
      contactEmail:      formData.get("contactEmail") as string || null,
      dealValue:         formData.get("dealValue") ? Number(formData.get("dealValue")) : undefined,
      owner:             formData.get("owner") as string || undefined,
      expectedCloseDate: formData.get("expectedCloseDate") as string || null,
      notes:             formData.get("notes") as string || null,
    });
    revalidatePath(`/admin/deals/${dealId}`);
    revalidatePath("/admin/deals");
    return { success: true };
  } catch {
    return { error: "Failed to update deal." };
  }
}
