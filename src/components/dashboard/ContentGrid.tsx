"use client";

import { useState } from "react";
import { Search, Download, FileText, Video, Image, BarChart2, Folder } from "lucide-react";
import type { DbContentItem, ContentType } from "@/lib/db-types";

const typeIcon: Record<ContentType, React.ReactNode> = {
  Script:   <FileText size={13} className="text-blue-500" />,
  Video:    <Video size={13} className="text-purple-500" />,
  Asset:    <Image size={13} className="text-pink-500" />,
  Report:   <BarChart2 size={13} className="text-amber-500" />,
  Campaign: <Folder size={13} className="text-orange-500" />,
};

const typeColors: Record<ContentType, string> = {
  Script:   "bg-blue-50 text-blue-700 border-blue-100",
  Video:    "bg-purple-50 text-purple-700 border-purple-100",
  Asset:    "bg-pink-50 text-pink-700 border-pink-100",
  Report:   "bg-amber-50 text-amber-700 border-amber-100",
  Campaign: "bg-orange-50 text-orange-700 border-orange-100",
};

const types: ContentType[] = ["Script", "Video", "Asset", "Report", "Campaign"];

export function ContentGrid({ items }: { items: DbContentItem[] }) {
  const [query, setQuery]     = useState("");
  const [typeFilter, setType] = useState<string>("All");

  const filtered = items.filter((c) => {
    const matchQ =
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.client_name.toLowerCase().includes(query.toLowerCase());
    const matchT = typeFilter === "All" || c.type === typeFilter;
    return matchQ && matchT;
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Content Library</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{items.length} files across all clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#d1d5db] w-[240px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {["All", ...types].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                typeFilter === t ? "bg-[#111111] text-white" : "text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="border border-[#e5e7eb] rounded-xl p-5 bg-white hover:border-[#d1d5db] transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${typeColors[item.type]}`}>
                {typeIcon[item.type]}
                {item.type}
              </span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-[#f3f4f6]">
                <Download size={13} className="text-[#6b7280]" />
              </button>
            </div>
            <p className="text-[13.5px] font-medium text-[#111111] leading-snug mb-1.5">{item.title}</p>
            <p className="text-[12px] text-[#9ca3af] mb-3">{item.client_name}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10.5px] text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#9ca3af]">{item.size_label}</p>
                <p className="text-[10.5px] text-[#d1d5db]">{item.created_at}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border border-[#e5e7eb] rounded-xl py-12 text-center text-[13px] text-[#9ca3af] bg-white">
          No files match your search.
        </div>
      )}
    </div>
  );
}
