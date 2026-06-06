"use client";

import { useState } from "react";
import { Search, Download, FileText, Video, Image, BarChart2, Folder } from "lucide-react";
import type { DbContentItem } from "@/lib/db-types";

type ContentType = DbContentItem["type"];

const typeIcon: Record<ContentType, React.ReactNode> = {
  Script:   <FileText size={14} className="text-blue-500" />,
  Video:    <Video size={14} className="text-purple-500" />,
  Asset:    <Image size={14} className="text-pink-500" />,
  Report:   <BarChart2 size={14} className="text-amber-500" />,
  Campaign: <Folder size={14} className="text-orange-500" />,
};

export default function FilesPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Files Vault</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">All your deliverables in one place</p>
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

      <div className="border border-[#e5e7eb] rounded-xl py-12 text-center text-[13px] text-[#9ca3af] bg-white">
        Files will appear here once deliverables are uploaded to your account.
      </div>
    </div>
  );
}
