import { verifyOwnerSession } from "@/lib/dal";
import { getConfigStatus } from "@/lib/config";
import { DeploymentView } from "./DeploymentView";

export const metadata = { title: "Deployment Checklist — Arashi OPS" };

export default async function DeploymentPage() {
  await verifyOwnerSession();
  const configStatus = getConfigStatus();
  return <DeploymentView configStatus={configStatus} />;
}
