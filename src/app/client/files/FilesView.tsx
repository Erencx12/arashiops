"use client";

import { useState } from "react";
import { Search, FileText, Video, Image, BarChart2, Folder } from "lucide-react";
import type { DbContentItem } from "@/lib/db-types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Script:   <FileText size={14} className="text-blue-500" />,
  Video:    <Video    size={14} className="text-purple-500" />,
  Asset:    <Image    size={14} className="text-pink-500" />,
  Report:   <BarChart2 size={14} className="text-amber-500" />,
  Campaign: <Folder   size={14} className="text-orange-500" />,
};

const ALL_TYPES = ["All", "Script", "Video", "Asset", "Report", "Campaign"] as const;
type Filter = (typeof ALL_TYPES)[number];

export function FilesView({ items }: { items: DbContentItem[] }) {
  const [query, setQuery]   = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const visible = items.filter(item => {
    const matchType  = filter === "All" || item.type === filter;
    const q          = query.toLowerCase();
    const matchQuery = !q ||
      item.title.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q));
    return matchType && matchQuery;
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Files Vault</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{items.length} file{items.length !== 1 ? "s" : ""} delivered</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative max-w-[280px] w-full">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#d1d5db]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {ALL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                filter === t
                  ? "bg-[#111111] text-white"
                  : "text-[#6b7280] hover:bg-[#f3f4f6]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-[#e5e7eb] rounded-xl py-14 text-center text-[13px] text-[#9ca3af] bg-white">
          Files will appear here once deliverables are uploaded to your account.
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-[#e5e7eb] rounded-xl py-14 text-center text-[13px] text-[#9ca3af] bg-white">
          No files match your search.
        </div>
      ) : (
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                {["File", "Type", "Version", "Size", "Tags", "Added"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {visible.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {TYPE_ICONS[item.type] ?? <FileText size={14} className="text-[#9ca3af]" />}
                      <span className="text-[13px] font-medium text-[#111111]">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{item.type}</td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280] font-mono">{item.version}</td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{item.size_label || "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10.5px] px-1.5 py-0.5 bg-[#f3f4f6] text-[#6b7280] rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
