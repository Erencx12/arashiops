import { verifyOwnerSession } from "@/lib/dal";
import { getWebhooks, getWebhookLogs } from "@/lib/queries";
import { WebhooksView } from "./WebhooksView";

export const metadata = { title: "Webhooks — Arashi OPS" };

export default async function WebhooksPage() {
  await verifyOwnerSession();
  const [webhooks, logs] = await Promise.all([getWebhooks(), getWebhookLogs()]);
  return <WebhooksView webhooks={webhooks} logs={logs} />;
}
