const styles: Record<string, string> = {
  Active:              "bg-emerald-50 text-emerald-700 border-emerald-100",
  Pending:             "bg-amber-50 text-amber-700 border-amber-100",
  Review:              "bg-blue-50 text-blue-700 border-blue-100",
  Completed:           "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  Paused:              "bg-orange-50 text-orange-700 border-orange-100",
  Churned:             "bg-red-50 text-red-700 border-red-100",
  Paid:                "bg-emerald-50 text-emerald-700 border-emerald-100",
  Overdue:             "bg-red-50 text-red-700 border-red-100",
  Draft:               "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  Approved:            "bg-emerald-50 text-emerald-700 border-emerald-100",
  Rejected:            "bg-red-50 text-red-700 border-red-100",
  "Revision Requested":"bg-orange-50 text-orange-700 border-orange-100",
  Upcoming:            "bg-blue-50 text-blue-700 border-blue-100",
  Cancelled:           "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  "Pending Signature": "bg-amber-50 text-amber-700 border-amber-100",
  Expired:             "bg-red-50 text-red-700 border-red-100",
  Silver:              "bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]",
  Gold:                "bg-amber-50 text-amber-700 border-amber-100",
  Platinum:            "bg-blue-50 text-blue-700 border-blue-100",
};

export function Badge({ label }: { label: string }) {
  const cls = styles[label] ?? "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {label}
    </span>
  );
}
