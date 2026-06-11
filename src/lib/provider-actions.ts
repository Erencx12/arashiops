"use server";

import { revalidatePath } from "next/cache";
import { verifyOwnerSession } from "./dal";
import { setDefaultProvider, toggleProviderEnabled } from "./queries";

export async function setDefaultProviderAction(name: string): Promise<void> {
  await verifyOwnerSession();
  await setDefaultProvider(name);
  revalidatePath("/admin/billing/providers");
  revalidatePath("/admin/billing");
}

export async function toggleProviderAction(id: number, enabled: boolean): Promise<void> {
  await verifyOwnerSession();
  await toggleProviderEnabled(id, enabled);
  revalidatePath("/admin/billing/providers");
}
