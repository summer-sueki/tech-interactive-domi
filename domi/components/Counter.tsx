"use client";
import { SearchIcon } from "./Icons";

export default function Counter({ found, total, dark }: { found: number; total: number; dark?: boolean }) {
  return (
    <div className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[15px] font-black shadow-[0_3px_0_rgba(0,0,0,.12)] ${dark ? "bg-white/15 text-white" : "bg-white text-navy"}`}>
      <SearchIcon size={18} className={dark ? "text-gold" : "text-tangerine"} />
      <span>{found}/{total}</span>
      <span className="font-bold opacity-60">found</span>
    </div>
  );
}
