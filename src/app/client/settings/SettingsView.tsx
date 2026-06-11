"use client";

import { useActionState, useState } from "react";
import { saveClientProfileAction } from "@/lib/client-actions";
import type { DbClient, DbSubscription } from "@/lib/db-types";

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#374151] bg-white focus:outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[11.5px] font-medium text-[#6b7280] mb-1.5";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white mb-5">
      <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#fafafa]">
        <p className="text-[13px] font-semibold text-[#111111]">{title}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

type NotifKey = "deliverables" | "approvals" | "meetings" | "reports";

const NOTIFS: { key: NotifKey; label: string; sub: string; defaultOn: boolean }[] = [
  { key: "deliverables", label: "New deliverables ready",   sub: "Email when a new file is added to your vault",          defaultOn: true  },
  { key: "approvals",    label: "Approval requests",        sub: "Email when something needs your review",                 defaultOn: true  },
  { key: "meetings",     label: "Meeting reminders",        sub: "Reminder 30 minutes before each scheduled call",         defaultOn: true  },
  { key: "reports",      label: "Monthly reports",          sub: "Email when your monthly performance report is ready",    defaultOn: false },
];

type Props = { client: DbClient; subscription: DbSubscription | null };

export function SettingsView({ client, subscription }: Props) {
  const [state, action, pending] = useActionState(saveClientProfileAction, null);

  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    deliverables: true, approvals: true, meetings: true, reports: false,
  });

  const engagementRows = [
    { label: "Current plan",    value: subscription?.plan_name ?? "—" },
    { label: "Monthly value",   value: subscription?.mrr ? `$${subscription.mrr.toLocaleString()}/mo` : "—" },
    { label: "Start date",      value: subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : client.start_date ?? "—" },
    { label: "Renewal date",    value: client.renewal_date ?? "—" },
    { label: "Engagement lead", value: client.owner ?? "Arashi OPS" },
    { label: "Status",          value: client.status },
  ];

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Settings</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Company profile and notification preferences</p>
      </div>

      <form action={action} className="max-w-[600px]">

        <Section title="Company Profile">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Company name</label>
              <input
                defaultValue={client.company_name}
                disabled
                className={`${inputCls} bg-[#f9fafb] text-[#9ca3af] cursor-not-allowed`}
              />
              <p className="text-[11px] text-[#9ca3af] mt-1">Contact your account manager to update company name.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primary contact *</label>
                <input name="contact_name" defaultValue={client.contact_name} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input
                  defaultValue={client.industry ?? ""}
                  disabled
                  className={`${inputCls} bg-[#f9fafb] text-[#9ca3af] cursor-not-allowed`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Contact email *</label>
              <input name="email" type="email" defaultValue={client.email} required className={inputCls} />
            </div>
          </div>
        </Section>

        <Section title="Engagement Details">
          <div className="divide-y divide-[#f3f4f6]">
            {engagementRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-[13px] text-[#6b7280]">{row.label}</span>
                <span className="text-[13px] font-medium text-[#111111]">{row.value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Notifications">
          <div className="space-y-4">
            {NOTIFS.map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#374151]">{n.label}</p>
                  <p className="text-[12px] text-[#9ca3af]">{n.sub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${notifs[n.key] ? "bg-[#111111]" : "bg-[#e5e7eb]"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs[n.key] ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {state?.error && (
          <p className="text-[12.5px] text-red-600 mb-3">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md mb-3">Changes saved.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
          >
            {pending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
