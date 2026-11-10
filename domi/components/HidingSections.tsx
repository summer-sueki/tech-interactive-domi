"use client";
/** "More Domis to find" (still hiding at exhibits) and "Limited-time hunts" (event Domis), as two sections. */
import Link from "next/link";
import { useState } from "react";
import Domi from "./Domi";
import { CalendarIcon } from "./Icons";
import { EXHIBITS } from "@/data/exhibits";
import { daysLeft, daysUntil, formatShort, getActiveLimitedHunts, getDomis, getUpcomingHunts, isAvailable, isLimited } from "@/lib/data";
import { useLocal } from "@/lib/store";
import type { Domi as DomiData } from "@/lib/types";

export default function HidingSections() {
  const local = useLocal();
  const [all, setAll] = useState(false);
  const owned = new Set((local?.collection ?? []).map((c) => c.domi_id));
  const events = new Map<string, DomiData[]>();
  [...getActiveLimitedHunts(), ...getUpcomingHunts()].forEach((d) => events.set(d.theme, [...(events.get(d.theme) ?? []), d]));
  const hiding = getDomis().filter((d) => !owned.has(d.id) && !isLimited(d) && isAvailable(d));
  const shown = all ? hiding : hiding.slice(0, 4);

  return (
    <section className="mt-8 px-4 pb-6">
      <h2 className="display px-1 text-[22px]">More Domis to find</h2>
      <p className="px-1 text-sm font-bold text-navy/60">{hiding.length} hiding at exhibits right now.</p>
      {(
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {shown.map((d, i) => {
              const x = EXHIBITS.find((e) => e.domi_slug === d.slug);
              const card = (
                <div className="flex h-full flex-col items-center rounded-[22px] bg-white p-3 text-center shadow-[0_4px_0_#E3E7EC]">
                  <Domi domi={d} size={64} silhouette tappable={false} pose="still" seed={i % 4} />
                  <p className="mt-1 text-[14px] font-black leading-tight">{x ? x.name : d.location_hint}</p>
                  <p className="mt-0.5 text-[12px] font-bold text-navy/55">{x?.closed ? "Closed today" : x ? x.location : "Somewhere in the museum"}</p>
                </div>
              );
              return <div key={d.id}>{x ? <Link href={`/exhibit/${x.id}`} className="block h-full">{card}</Link> : card}</div>;
            })}
          </div>
          {hiding.length > 4 && (
            <button onClick={() => setAll((v) => !v)} className="mt-3 h-11 w-full rounded-full bg-white text-[14px] font-black text-purple shadow-[0_3px_0_#EBD3F2]">
              {all ? "Show less" : `Show all ${hiding.length}`}
            </button>
          )}
        </>
      )}

      {events.size > 0 && (
        <>
          <h2 className="display mt-8 px-1 text-[22px]">Limited-time hunts</h2>
          <p className="px-1 text-sm font-bold text-navy/60">Special Domis that only appear for a while.</p>
          <div className="mt-3 space-y-3">
            {[...events.entries()].map(([theme, ds]) => {
              const d = ds[0];
              const live = isAvailable(d);
              return (
                <div key={theme} className={`flex items-center gap-3 rounded-[24px] p-4 ${live ? "bg-pink text-white shadow-[0_5px_0_#B5006A]" : "bg-white shadow-[0_5px_0_#DCE3EA]"}`}>
                  <Domi domi={d} size={48} silhouette silhouetteColor={live ? "light" : "dark"} tappable={false} shadow={false} pose="still" />
                  <div className="min-w-0 flex-1">
                    <p className="display text-[16px] leading-tight">{theme}</p>
                    <p className={`mt-1 flex items-center gap-1 text-[13px] font-bold ${live ? "text-white/90" : "text-navy/60"}`}>
                      <CalendarIcon size={14} />
                      {d.start_date && formatShort(d.start_date)}{d.end_date && d.start_date?.slice(0, 10) !== d.end_date.slice(0, 10) ? ` – ${formatShort(d.end_date)}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${live ? "bg-white text-pink" : "bg-gold text-navy"}`}>
                    {live ? `${daysLeft(d)} days left` : `In ${daysUntil(d)} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
