"use client";

import { useState } from "react";
import { Download, FileText, Video, Image, BarChart2, Folder } from "lucide-react";
import type { DbContentItem, ContentType } from "@/lib/db-types";

const typeIcon: Record<ContentType, React.ReactNode> = {
  Script:   <FileText size={14} className="text-blue-500" />,
  Video:    <Video size={14} className="text-purple-500" />,
  Asset:    <Image size={14} className="text-pink-500" />,
  Report:   <BarChart2 size={14} className="text-amber-500" />,
  Campaign: <Folder size={14} className="text-orange-500" />,
};

const typeColors: Record<ContentType, string> = {
  Script:   "bg-blue-50 text-blue-700 border-blue-100",
  Video:    "bg-purple-50 text-purple-700 border-purple-100",
  Asset:    "bg-pink-50 text-pink-700 border-pink-100",
  Report:   "bg-amber-50 text-amber-700 border-amber-100",
  Campaign: "bg-orange-50 text-orange-700 border-orange-100",
};

export function DeliverablesTable({ items }: { items: DbContentItem[] }) {
  const types = [...new Set(items.map((i) => i.type))] as ContentType[];
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Deliverables</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">{items.length} files · {types.length} types</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-[#e5e7eb] pb-0">
        {["All", ...types].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              filter === t ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#374151]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["File", "Type", "Tags", "Date", "Size", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#fafafa] transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                      {typeIcon[item.type]}
                    </div>
                    <p className="text-[13px] font-medium text-[#111111] leading-snug">{item.title}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[10.5px] text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af]">{item.created_at}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af]">{item.size_label}</td>
                <td className="px-4 py-3.5">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[12px] text-[#6b7280] hover:text-[#111111]">
                    <Download size={13} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[#9ca3af]">No files in this category.</div>
        )}
      </div>
    </div>
  );
}
