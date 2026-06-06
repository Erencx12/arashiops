const styles: Record<string, string> = {
  // Client status
  Active:              "bg-emerald-50 text-emerald-700 border-emerald-100",
  Pending:             "bg-amber-50 text-amber-700 border-amber-100",
  Review:              "bg-blue-50 text-blue-700 border-blue-100",
  Completed:           "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  Paused:              "bg-orange-50 text-orange-700 border-orange-100",
  Churned:             "bg-red-50 text-red-700 border-red-100",
  Suspended:           "bg-red-50 text-red-700 border-red-100",
  Archived:            "bg-[#f3f4f6] text-[#9ca3af] border-[#e5e7eb]",
  // Finance
  Paid:                "bg-emerald-50 text-emerald-700 border-emerald-100",
  Overdue:             "bg-red-50 text-red-700 border-red-100",
  // Deliverable / approval
  Draft:               "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  Approved:            "bg-emerald-50 text-emerald-700 border-emerald-100",
  Rejected:            "bg-red-50 text-red-700 border-red-100",
  "Revision Requested":"bg-orange-50 text-orange-700 border-orange-100",
  "Awaiting Approval": "bg-amber-50 text-amber-700 border-amber-100",
  "Internal Review":   "bg-blue-50 text-blue-700 border-blue-100",
  // Project status
  Planning:            "bg-violet-50 text-violet-700 border-violet-100",
  "Waiting On Client": "bg-amber-50 text-amber-700 border-amber-100",
  Cancelled:           "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  // Task status
  "To Do":             "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  "In Progress":       "bg-blue-50 text-blue-700 border-blue-100",
  Blocked:             "bg-red-50 text-red-700 border-red-100",
  // Task priority
  Critical:            "bg-red-50 text-red-700 border-red-100",
  High:                "bg-orange-50 text-orange-700 border-orange-100",
  Medium:              "bg-amber-50 text-amber-700 border-amber-100",
  Low:                 "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  // Contracts / meetings
  Upcoming:            "bg-blue-50 text-blue-700 border-blue-100",
  "Pending Signature": "bg-amber-50 text-amber-700 border-amber-100",
  Expired:             "bg-red-50 text-red-700 border-red-100",
  // Tier
  Silver:              "bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]",
  Gold:                "bg-amber-50 text-amber-700 border-amber-100",
  Platinum:            "bg-blue-50 text-blue-700 border-blue-100",
  Enterprise:          "bg-violet-50 text-violet-700 border-violet-100",
  // Milestone
  "In Review":         "bg-blue-50 text-blue-700 border-blue-100",
  // Deal stages
  Lead:                      "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  Contacted:                 "bg-blue-50 text-blue-700 border-blue-100",
  "Discovery Scheduled":     "bg-violet-50 text-violet-700 border-violet-100",
  "Discovery Completed":     "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Proposal Sent":           "bg-amber-50 text-amber-700 border-amber-100",
  Negotiation:               "bg-orange-50 text-orange-700 border-orange-100",
  Won:                       "bg-emerald-50 text-emerald-700 border-emerald-100",
  Lost:                      "bg-red-50 text-red-700 border-red-100",
  // Proposal statuses
  Sent:                      "bg-blue-50 text-blue-700 border-blue-100",
  Viewed:                    "bg-indigo-50 text-indigo-700 border-indigo-100",
  Accepted:                  "bg-emerald-50 text-emerald-700 border-emerald-100",
  // Invoice
  "Partially Paid":          "bg-teal-50 text-teal-700 border-teal-100",
  // Renewal
  "At Risk":                 "bg-orange-50 text-orange-700 border-orange-100",
  Renewed:                   "bg-emerald-50 text-emerald-700 border-emerald-100",
  // Contract
  Signed:                    "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function Badge({ label }: { label: string }) {
  const cls = styles[label] ?? "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {label}
    </span>
  );
}
