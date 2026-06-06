import Link from "next/link";
import { Video, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { getMeetings } from "@/lib/queries";

export const metadata = { title: "Meetings" };

export default async function MeetingsPage() {
  const meetings = await getMeetings();
  const upcoming  = meetings.filter((m) => m.status === "Upcoming");
  const completed = meetings.filter((m) => m.status === "Completed");

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Meetings</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{upcoming.length} upcoming · {completed.length} past</p>
        </div>
        <Link
          href="/book"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Video size={12} />
          Book via Cal.com
        </Link>
      </div>

      {/* Upcoming */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Upcoming</p>
        {upcoming.length === 0 ? (
          <div className="border border-[#e5e7eb] rounded-xl py-10 text-center text-[13px] text-[#9ca3af] bg-white">
            No upcoming meetings.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m) => (
              <div key={m.id} className="border border-[#e5e7eb] rounded-xl p-5 bg-white hover:border-[#d1d5db] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] flex flex-col items-center justify-center shrink-0">
                      <Calendar size={14} className="text-[#374151]" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#111111]">{m.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] text-[#9ca3af]">{m.meeting_date}</span>
                        <span className="text-[#e5e7eb]">·</span>
                        <span className="text-[12px] text-[#9ca3af]">{m.meeting_time}</span>
                        <span className="text-[#e5e7eb]">·</span>
                        <Clock size={10} className="text-[#d1d5db]" />
                        <span className="text-[12px] text-[#9ca3af]">{m.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11.5px] text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded">{m.type}</span>
                    <Badge label={m.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Past Calls</p>
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <div className="divide-y divide-[#f3f4f6]">
            {completed.map((m) => (
              <div key={m.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-[13px] font-medium text-[#111111]">{m.title}</p>
                    <p className="text-[12px] text-[#9ca3af] mt-0.5">{m.meeting_date} · {m.meeting_time} · {m.duration}</p>
                  </div>
                  <Badge label={m.status} />
                </div>
                {m.notes && (
                  <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 mt-2">
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-[12.5px] text-[#374151] leading-relaxed">{m.notes}</p>
                  </div>
                )}
              </div>
            ))}
            {completed.length === 0 && (
              <div className="py-8 text-center text-[13px] text-[#9ca3af]">No past meetings.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
