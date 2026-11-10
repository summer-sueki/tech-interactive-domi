"use client";
/** Two destinations: Explore (find your way) and My Domis (the game). */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CollectionIcon, MapIcon } from "./Icons";
import { useLocal } from "@/lib/store";

export default function TabBar() {
  const path = usePathname();
  const local = useLocal();
  const exploreOn = path.startsWith("/explore") || path.startsWith("/exhibit");
  const domisOn = !exploreOn;
  const count = local?.collection.length;
  const tab = (href: string, label: string, Icon: typeof MapIcon, on: boolean, accent: string, badge?: number) => (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`relative flex h-14 flex-1 items-center justify-center gap-2 rounded-[20px] text-[15px] font-black transition-colors ${on ? "text-white" : "text-navy/55"}`}
      style={on ? { background: accent } : undefined}
    >
      <Icon size={22} />
      {label}
      {badge !== undefined && (
        <span className={`rounded-full px-1.5 text-[11px] ${on ? "bg-white/25" : "bg-gold text-navy"}`}>{badge}</span>
      )}
    </Link>
  );
  return (
    <nav className="pb-safe absolute inset-x-0 bottom-0 z-40 rounded-t-[28px] border-t-2 border-black/5 bg-white/95 px-4 pt-2.5 backdrop-blur" aria-label="Main">
      <div className="flex gap-2">
        {tab("/explore", "Explore", MapIcon, exploreOn, "#0088CE")}
        {tab("/my-domis", "My Domis", CollectionIcon, domisOn, "#7F3896", count)}
      </div>
    </nav>
  );
}
