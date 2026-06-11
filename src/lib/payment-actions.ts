"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { logPayment, updateInvoiceStatus, updateContractStatus, createContract, createInvoice, getInvoiceById } from "./queries";
import { sql } from "./db";
import { sendInvoiceEmail } from "./email";

export type PaymentActionState = { error?: string; success?: boolean } | null;

const PaymentSchema = z.object({
  invoiceId:   z.coerce.number().optional(),
  clientId:    z.coerce.number().optional(),
  amount:      z.coerce.number().positive(),
  paymentDate: z.string().min(1),
  method:      z.string().min(1),
  reference:   z.string().optional(),
  notes:       z.string().optional(),
});

export async function logPaymentAction(
  _prev: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  try {
    await verifyOwnerSession();
    const raw = {
      invoiceId:   formData.get("invoiceId"),
      clientId:    formData.get("clientId"),
      amount:      formData.get("amount"),
      paymentDate: formData.get("paymentDate"),
      method:      formData.get("method") ?? "Bank Transfer",
      reference:   formData.get("reference"),
      notes:       formData.get("notes"),
    };
    const parsed = PaymentSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please fill in required fields." };

    await logPayment({
      invoiceId:   parsed.data.invoiceId || null,
      clientId:    parsed.data.clientId || null,
      amount:      parsed.data.amount,
      paymentDate: parsed.data.paymentDate,
      method:      parsed.data.method,
      reference:   parsed.data.reference || null,
      notes:       parsed.data.notes || null,
    });

    if (parsed.data.invoiceId) {
      await updateInvoiceStatus(parsed.data.invoiceId, "Paid");
    }

    await sql`INSERT INTO activity_log (type, description) VALUES ('payment', ${`Payment logged: $${parsed.data.amount}`})`;
    revalidatePath("/admin/invoices");
    return { success: true };
  } catch {
    return { error: "Something went wrong." };
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: number,
  status: string
): Promise<void> {
  await verifyOwnerSession();
  await updateInvoiceStatus(invoiceId, status);
  if (status === "Sent") {
    const invoice = await getInvoiceById(invoiceId);
    if (invoice?.client_email) {
      await sendInvoiceEmail(
        invoice.client_email,
        invoice.contact_name ?? invoice.client_email,
        invoice.invoice_number,
        invoice.amount,
        invoice.due_date ?? "—"
      );
    }
  }
  revalidatePath("/admin/invoices");
}

export async function updateContractStatusAction(
  contractId: number,
  status: string
): Promise<void> {
  await verifyOwnerSession();
  await updateContractStatus(contractId, status);
  revalidatePath("/admin/contracts");
}

const ContractSchema = z.object({
  clientId:     z.coerce.number().positive(),
  type:         z.string().min(1),
  tier:         z.string().min(1),
  status:       z.string().min(1),
  startDate:    z.string().min(1),
  endDate:      z.string().min(1),
  monthlyValue: z.coerce.number().min(0),
  dealId:       z.coerce.number().optional(),
  proposalId:   z.coerce.number().optional(),
});

export type ContractActionState = { error?: string; success?: boolean } | null;

export async function createContractAction(
  _prev: ContractActionState,
  formData: FormData
): Promise<ContractActionState> {
  try {
    await verifyOwnerSession();
    const raw = {
      clientId:     formData.get("clientId"),
      type:         formData.get("type") ?? "Service Agreement",
      tier:         formData.get("tier") ?? "Silver",
      status:       formData.get("status") ?? "Draft",
      startDate:    formData.get("startDate"),
      endDate:      formData.get("endDate"),
      monthlyValue: formData.get("monthlyValue"),
      dealId:       formData.get("dealId"),
      proposalId:   formData.get("proposalId"),
    };
    const parsed = ContractSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please fill in all required fields." };

    await createContract({
      clientId:     parsed.data.clientId,
      type:         parsed.data.type,
      tier:         parsed.data.tier,
      status:       parsed.data.status,
      startDate:    parsed.data.startDate,
      endDate:      parsed.data.endDate,
      monthlyValue: parsed.data.monthlyValue,
      dealId:       parsed.data.dealId || null,
      proposalId:   parsed.data.proposalId || null,
    });

    revalidatePath("/admin/contracts");
    return { success: true };
  } catch {
    return { error: "Something went wrong." };
  }
}

const InvoiceSchema = z.object({
  clientId:    z.coerce.number().positive(),
  amount:      z.coerce.number().positive(),
  issueDate:   z.string().min(1),
  dueDate:     z.string().min(1),
  description: z.string().optional(),
  dealId:      z.coerce.number().optional(),
  proposalId:  z.coerce.number().optional(),
});

export type InvoiceActionState = { error?: string; success?: boolean; invoiceNumber?: string } | null;

export async function createInvoiceAction(
  _prev: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  try {
    await verifyOwnerSession();
    const raw = {
      clientId:    formData.get("clientId"),
      amount:      formData.get("amount"),
      issueDate:   formData.get("issueDate"),
      dueDate:     formData.get("dueDate"),
      description: formData.get("description"),
      dealId:      formData.get("dealId"),
      proposalId:  formData.get("proposalId"),
    };
    const parsed = InvoiceSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please fill in all required fields." };

    const result = await createInvoice({
      clientId:    parsed.data.clientId,
      amount:      parsed.data.amount,
      status:      "Draft",
      issueDate:   parsed.data.issueDate,
      dueDate:     parsed.data.dueDate,
      description: parsed.data.description || null,
      dealId:      parsed.data.dealId || null,
      proposalId:  parsed.data.proposalId || null,
    });

    await sql`INSERT INTO activity_log (type, description) VALUES ('invoice', ${`Invoice created: ${result.invoice_number}`})`;
    revalidatePath("/admin/invoices");
    return { success: true, invoiceNumber: result.invoice_number };
  } catch {
    return { error: "Something went wrong." };
  }
}
