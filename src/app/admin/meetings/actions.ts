"use server";

import { revalidatePath } from "next/cache";
import { verifyOwnerSession } from "@/lib/dal";
import { deleteMeeting } from "@/lib/queries";

export async function deleteMeetingAction(id: number): Promise<void> {
  await verifyOwnerSession();
  await deleteMeeting(id);
  revalidatePath("/admin/meetings");
}
