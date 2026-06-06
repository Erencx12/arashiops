export const metadata = { title: "Client Settings" };

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

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="block text-[11.5px] font-medium text-[#6b7280] mb-1.5">{label}</label>
      <input
        defaultValue={value}
        type={type}
        className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#374151] bg-white focus:outline-none focus:border-[#d1d5db]"
      />
    </div>
  );
}

export default function ClientSettingsPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Settings</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Company profile and notification preferences</p>
      </div>

      <div className="max-w-[600px]">

        <Section title="Company Profile">
          <div className="space-y-4">
            <Field label="Company name"  value="Relay Software" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary contact"  value="Alex Riordan" />
              <Field label="Role"             value="Head of Growth" />
            </div>
            <Field label="Email"   value="growth@relaysoftware.com" type="email" />
            <Field label="Website" value="https://relaysoftware.com" />
          </div>
        </Section>

        <Section title="Engagement Details">
          <div className="divide-y divide-[#f3f4f6] space-y-0">
            {[
              { label: "Current plan",    value: "Gold Engagement" },
              { label: "Monthly value",   value: "$4,500/mo" },
              { label: "Start date",      value: "Feb 5, 2026" },
              { label: "Renewal date",    value: "Feb 5, 2027" },
              { label: "Engagement lead", value: "Soham Das" },
              { label: "Exit notice",     value: "30 days" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-[13px] text-[#6b7280]">{row.label}</span>
                <span className="text-[13px] font-medium text-[#111111]">{row.value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Notifications">
          <div className="space-y-4">
            {[
              { label: "New deliverables ready",    sub: "Email when a new file is added to your vault", enabled: true },
              { label: "Approval requests",         sub: "Email when something needs your review", enabled: true },
              { label: "Meeting reminders",         sub: "Reminder 30 minutes before each scheduled call", enabled: true },
              { label: "Monthly reports",           sub: "Email when your monthly performance report is ready", enabled: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#374151]">{n.label}</p>
                  <p className="text-[12px] text-[#9ca3af]">{n.sub}</p>
                </div>
                <div className={`w-9 h-5 rounded-full flex items-center px-0.5 ${n.enabled ? "bg-[#111111]" : "bg-[#e5e7eb]"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${n.enabled ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="flex justify-end">
          <button className="px-5 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
