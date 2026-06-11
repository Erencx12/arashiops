import { verifyOwnerSession } from "@/lib/dal";
import { getConfigStatus, getCriticalMissingCount } from "@/lib/config";
import { getAuditLogs, getErrorLogs, getLatestHealthChecks } from "@/lib/queries";
import { SystemView } from "./SystemView";

export const metadata = { title: "System — Arashi OPS" };

export default async function SystemPage() {
  await verifyOwnerSession();

  const [configStatus, auditLogs, errorLogs, healthChecks] = await Promise.all([
    Promise.resolve(getConfigStatus()),
    getAuditLogs(50),
    getErrorLogs(20),
    getLatestHealthChecks(),
  ]);

  const criticalMissing = getCriticalMissingCount();

  return (
    <SystemView
      configStatus={configStatus}
      criticalMissing={criticalMissing}
      auditLogs={auditLogs}
      errorLogs={errorLogs}
      healthChecks={healthChecks}
    />
  );
}
