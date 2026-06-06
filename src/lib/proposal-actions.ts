"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { createProposal, updateProposalStatus, createDiscoveryCall } from "./queries";
import { sql } from "./db";

const ProposalSchema = z.object({
  title:         z.string().min(1),
  package:       z.string().min(1),
  monthlyValue:  z.coerce.number().min(0),
  setupFee:      z.coerce.number().min(0).default(0),
  dealId:        z.coerce.number().optional(),
  clientId:      z.coerce.number().optional(),
  deliverables:  z.string().optional(),
  terms:         z.string().optional(),
  timeline:      z.string().optional(),
  notes:         z.string().optional(),
  expiresAt:     z.string().optional(),
});

export type ProposalActionState = { error?: string; success?: boolean; proposalId?: number } | null;

export async function createProposalAction(
  _prev: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  try {
    await verifyOwnerSession();
    const raw = {
      title:        formData.get("title"),
      package:      formData.get("package") ?? "Silver",
      monthlyValue: formData.get("monthlyValue"),
      setupFee:     formData.get("setupFee") ?? "0",
      dealId:       formData.get("dealId"),
      clientId:     formData.get("clientId"),
      deliverables: formData.get("deliverables"),
      terms:        formData.get("terms"),
      timeline:     formData.get("timeline"),
      notes:        formData.get("notes"),
      expiresAt:    formData.get("expiresAt"),
    };
    const parsed = ProposalSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please fill in required fields." };

    const proposal = await createProposal({
      dealId:       parsed.data.dealId || null,
      clientId:     parsed.data.clientId || null,
      title:        parsed.data.title,
      package:      parsed.data.package,
      monthlyValue: parsed.data.monthlyValue,
      setupFee:     parsed.data.setupFee,
      deliverables: parsed.data.deliverables || null,
      terms:        parsed.data.terms || null,
      timeline:     parsed.data.timeline || null,
      notes:        parsed.data.notes || null,
      expiresAt:    parsed.data.expiresAt || null,
    });

    await sql`INSERT INTO activity_log (type, description) VALUES ('deal', ${`Proposal created: ${proposal.title}`})`;
    revalidatePath("/admin/proposals");
    if (parsed.data.dealId) revalidatePath(`/admin/deals/${parsed.data.dealId}`);
    return { success: true, proposalId: proposal.id };
  } catch {
    return { error: "Something went wrong." };
  }
}

export async function updateProposalStatusAction(
  proposalId: number,
  status: string
): Promise<{ ok: boolean }> {
  try {
    await verifyOwnerSession();
    await updateProposalStatus(proposalId, status);
    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${proposalId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

const DiscoveryCallSchema = z.object({
  company:          z.string().min(1),
  contactName:      z.string().min(1),
  dealId:           z.coerce.number().optional(),
  callDate:         z.string().optional(),
  meetingNotes:     z.string().optional(),
  painPoints:       z.string().optional(),
  requirements:     z.string().optional(),
  budget:           z.string().optional(),
  decisionTimeline: z.string().optional(),
  nextAction:       z.string().optional(),
});

export type DiscoveryCallState = { error?: string; success?: boolean } | null;

export async function createDiscoveryCallAction(
  _prev: DiscoveryCallState,
  formData: FormData
): Promise<DiscoveryCallState> {
  try {
    await verifyOwnerSession();
    const raw = {
      company:          formData.get("company"),
      contactName:      formData.get("contactName"),
      dealId:           formData.get("dealId"),
      callDate:         formData.get("callDate"),
      meetingNotes:     formData.get("meetingNotes"),
      painPoints:       formData.get("painPoints"),
      requirements:     formData.get("requirements"),
      budget:           formData.get("budget"),
      decisionTimeline: formData.get("decisionTimeline"),
      nextAction:       formData.get("nextAction"),
    };
    const parsed = DiscoveryCallSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please fill in required fields." };

    await createDiscoveryCall({
      dealId:           parsed.data.dealId || null,
      company:          parsed.data.company,
      contactName:      parsed.data.contactName,
      callDate:         parsed.data.callDate || null,
      meetingNotes:     parsed.data.meetingNotes || null,
      painPoints:       parsed.data.painPoints || null,
      requirements:     parsed.data.requirements || null,
      budget:           parsed.data.budget || null,
      decisionTimeline: parsed.data.decisionTimeline || null,
      nextAction:       parsed.data.nextAction || null,
    });

    revalidatePath("/admin/discovery");
    if (parsed.data.dealId) revalidatePath(`/admin/deals/${parsed.data.dealId}`);
    return { success: true };
  } catch {
    return { error: "Something went wrong." };
  }
}
