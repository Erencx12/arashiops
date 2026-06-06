export const metadata = { title: "Settings" };

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

export default function SettingsPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Settings</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Agency profile and preferences</p>
      </div>

      <div className="max-w-[640px]">

        {/* Profile */}
        <Section title="Your Profile">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#f3f4f6]">
            <div className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
              <span className="text-[18px] font-bold text-white">SD</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#111111]">Soham Das</p>
              <p className="text-[12.5px] text-[#9ca3af]">Owner · Arashi OPS</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" value="Soham" />
            <Field label="Last name" value="Das" />
            <Field label="Email" value="yo.gamegenesis@gmail.com" type="email" />
            <Field label="Role" value="Owner" />
          </div>
        </Section>

        {/* Agency */}
        <Section title="Agency Details">
          <div className="space-y-4">
            <Field label="Agency name" value="Arashi OPS" />
            <Field label="Website" value="https://meridian.co" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default tier" value="Gold" />
              <Field label="Min engagement (months)" value="3" />
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div className="space-y-4">
            {[
              { label: "New approval requests", sub: "Notify when an agent submits work for review", enabled: true },
              { label: "Overdue invoices", sub: "Alert when an invoice passes its due date", enabled: true },
              { label: "Client health drops", sub: "Notify when a client health score falls below 70", enabled: true },
              { label: "Meeting reminders", sub: "Email reminder 30 minutes before each meeting", enabled: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#374151]">{n.label}</p>
                  <p className="text-[12px] text-[#9ca3af]">{n.sub}</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${n.enabled ? "bg-[#111111]" : "bg-[#e5e7eb]"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${n.enabled ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Cal.com */}
        <Section title="Cal.com Integration">
          <div className="space-y-4">
            <div>
              <p className="text-[11.5px] font-medium text-[#6b7280] mb-1.5">Booking link</p>
              <div className="flex items-center gap-2">
                <input
                  defaultValue="cal.com/soham-das-osleft/discovery-call"
                  readOnly
                  className="flex-1 border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#374151] bg-[#fafafa] focus:outline-none font-mono"
                />
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Google Calendar connected · Google Meet enabled
            </div>
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
