"use client";

import { useState } from "react";
import { Search, Download, FileText, Video, Image, BarChart2, Folder } from "lucide-react";
import { contentItems, type ContentType } from "@/lib/dashboard-data";

const CLIENT = "Relay Software";
const files  = contentItems.filter((c) => c.client === CLIENT);

const typeIcon: Record<ContentType, React.ReactNode> = {
  Script:   <FileText size={14} className="text-blue-500" />,
  Video:    <Video size={14} className="text-purple-500" />,
  Asset:    <Image size={14} className="text-pink-500" />,
  Report:   <BarChart2 size={14} className="text-amber-500" />,
  Campaign: <Folder size={14} className="text-orange-500" />,
};

export default function FilesPage() {
  const [query, setQuery] = useState("");

  const filtered = files.filter((f) =>
    f.title.toLowerCase().includes(query.toLowerCase()) ||
    f.type.toLowerCase().includes(query.toLowerCase())
  );

  const totalSize = files.length;

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Files Vault</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{totalSize} files · all your deliverables in one place</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-[320px]">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#d1d5db]"
        />
      </div>

      {/* File categories */}
      {(["Script","Report","Video","Asset","Campaign"] as ContentType[]).map((type) => {
        const typeFiles = filtered.filter((f) => f.type === type);
        if (typeFiles.length === 0) return null;
        return (
          <div key={type} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {typeIcon[type]}
              <p className="text-[12px] font-semibold text-[#374151]">{type}s</p>
              <span className="text-[11px] text-[#9ca3af]">({typeFiles.length})</span>
            </div>
            <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
              <div className="divide-y divide-[#f3f4f6]">
                {typeFiles.map((f) => (
                  <div key={f.id} className="px-5 py-3.5 flex items-center justify-between group hover:bg-[#fafafa] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                        {typeIcon[f.type]}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#111111]">{f.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-[#9ca3af]">{f.created}</p>
                          <span className="text-[#e5e7eb]">·</span>
                          <p className="text-[11px] text-[#9ca3af]">{f.size}</p>
                        </div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] text-[#374151] text-[12px] font-medium rounded-md hover:bg-[#f9fafb]">
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="border border-[#e5e7eb] rounded-xl py-12 text-center text-[13px] text-[#9ca3af] bg-white">
          No files match your search.
        </div>
      )}
    </div>
  );
}
