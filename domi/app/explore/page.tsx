"use client";
/**
 * Explore: the functional side of the app. Find exhibits and your next stop.
 * (Project brief: exhibit directory, "find your next stop".) Copy is kept to one line per card.
 */
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ExhibitThumb from "@/components/ExhibitThumb";
import LoginButton from "@/components/LoginButton";
import NextStops from "@/components/NextStops";
import TabBar from "@/components/TabBar";
import { CalendarIcon, PinIcon, SearchIcon } from "@/components/Icons";
import { EXHIBITS, GROUPS } from "@/data/exhibits";
import { daysLeft, daysUntil, formatShort, getActiveLimitedHunts, getDomiBySlug, getUpcomingHunts } from "@/lib/data";
import { getVisits } from "@/lib/recommend";
import { useLocal } from "@/lib/store";
import type { Domi, Exhibit } from "@/lib/types";

/**
 * One condensed filter row mixing the most useful kinds of filter: time, type, the game, progress,
 * and the two busiest topics. Single choice, one line.
 */
type Filter = { id: string; label: string; test: (x: Exhibit, ctx: { visited: Set<string>; hiding: (x: Exhibit) => boolean }) => boolean };
const FILTERS: Filter[] = [
  { id: "all", label: "All", test: () => true },
  { id: "quick", label: "≤ 15 min", test: (x) => x.minutes <= 15 },
  { id: "hands-on", label: "Hands-on", test: (x) => x.type === "Hands-on" || x.type === "Lab" },
  { id: "domi", label: "Domi hiding", test: (x, c) => !x.closed && c.hiding(x) },
  { id: "new", label: "Not explored", test: (x, c) => !c.visited.has(x.id) },
  { id: "build", label: "Build & Play", test: (x) => x.topic === "Build & Play" },
  { id: "ai", label: "AI & Digital", test: (x) => x.topic === "AI & Digital" },
];

export default function Explore() {
  const local = useLocal();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  // Stacked sticky headers: main header → "All exhibits" + filters → group label. Each sits under the one above.
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const headerH = useHeight(headerRef);
  const barH = useHeight(barRef);
  const visits = getVisits(local?.collection ?? [], local?.checkins ?? []);
  const visited = new Set(visits.map((v) => v.exhibit.id));
  const found = new Set((local?.collection ?? []).map((c) => c.domi_id));
  const searching = q.trim().length > 0;
  const filtered = searching || filter !== "all";
  const hiding = (x: Exhibit) => !!x.domi_slug && !found.has(getDomiBySlug(x.domi_slug)?.id ?? "");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return EXHIBITS.filter((x) =>
      FILTERS.find((f) => f.id === filter)!.test(x, { visited, hiding }) &&
      (!term || `${x.name} ${x.topic} ${x.blurb} ${x.location}`.toLowerCase().includes(term)),
    ).sort((a, b) => Number(!!a.closed) - Number(!!b.closed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filter, local]);

  return (
    <main className="relative h-dvh overflow-hidden bg-offwhite">
      <div className="pb-tabbar h-full overflow-y-auto" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 24)}>
        {/* Sticky header: title, settings and search stay pinned. Once you scroll, the small label and count tuck away. */}
        <header ref={headerRef} className="pt-safe sticky top-0 z-30 bg-gradient-to-b from-[#3FB2EC] to-[#7FCDF3] px-5 pb-3 shadow-[0_6px_12px_-10px_rgba(0,40,80,.5)]">
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
            <p className="overflow-hidden pt-1 text-xs font-black uppercase tracking-[0.14em] text-white/90">The Tech Interactive</p>
          </div>
          <div className="flex items-center justify-between">
            <h1 className={`display leading-none text-white transition-all duration-300 ${scrolled ? "text-[20px] opacity-90" : "text-[34px] drop-shadow-[0_3px_0_rgba(0,80,130,.35)]"}`}>Explore</h1>
            <LoginButton quiet={scrolled} />
          </div>
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
            <p className="overflow-hidden font-bold text-navy/70">
              <span className="block pt-1">{EXHIBITS.length} exhibits · <span className="font-black text-navy">{visits.length}</span> explored</span>
            </p>
          </div>
          <label className={`flex h-12 items-center gap-2 rounded-2xl bg-white px-4 shadow-[0_3px_0_rgba(0,0,0,.08)] transition-[margin] duration-300 ${scrolled ? "mt-2" : "mt-3"}`}>
            <SearchIcon size={20} className="text-navy/50" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exhibits" aria-label="Search exhibits"
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-bold outline-none placeholder:text-navy/40"
            />
            {searching && <button onClick={() => setQ("")} aria-label="Clear search" className="grid h-9 w-9 place-items-center rounded-full bg-offwhite text-sm font-black text-navy/60">✕</button>}
          </label>
        </header>

        {!searching && <NextStops />}
        {!searching && <HappeningNow />}

        <section className="mt-5">
          {/* Sticky: the section title and filters stay under the main header while you browse the list */}
          <div ref={barRef} className="sticky z-20 bg-offwhite/95 pb-2.5 pt-3 backdrop-blur" style={{ top: headerH }}>
            <h2 className="display px-5 text-[22px]">{searching ? "Results" : "All exhibits"}<span className="ml-2 text-[14px] font-black text-navy/45">{list.length}</span></h2>
            <div className="mt-2">
              <ChipRow label="Filter" items={FILTERS.map((f) => [f.label, f.id] as const)} value={filter} onChange={setFilter} />
            </div>
          </div>
          {(filtered ? [["Results", list] as const] : GROUPS.map((g) => [g, list.filter((x) => x.group === g)] as const)).map(([group, items]) => (
            <div key={group}>
              {!filtered && (
                // Sticky group label: stays under the filter bar until the next group pushes it away
                <h3 className="sticky z-10 bg-offwhite/95 px-5 pb-1.5 pt-2.5 text-xs font-black uppercase tracking-[0.14em] text-navy/50 backdrop-blur" style={{ top: headerH + barH }}>
                  {group} <span className="text-navy/35">· {items.length}</span>
                </h3>
              )}
              <ul className="space-y-3 px-4 pt-2">
                {items.map((x) => (
                  <li key={x.id}>
                    <Link href={`/exhibit/${x.id}`} className={`chunky flex items-center gap-3 rounded-[24px] bg-white p-3 ${x.closed ? "opacity-60 grayscale" : ""}`} style={{ ["--btn-edge" as string]: "#DCE3EA", borderRadius: 24 }}>
                      <ExhibitThumb exhibit={x} hidden={!x.closed && hiding(x)} />
                      <div className="min-w-0 flex-1">
                        <p className="display text-[18px] leading-tight">{x.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[13px] font-bold text-navy/60">
                          <PinIcon size={13} /> {x.location}
                        </p>
                        <p className="mt-1 truncate text-[14px] font-semibold text-navy/80">{x.blurb}</p>
                        {(x.closed || visited.has(x.id) || hiding(x)) && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {x.closed ? (
                              <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-black text-navy/70">Closed today</span>
                            ) : (
                              <>
                                {visited.has(x.id) && <span className="rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-black text-[#0E8840]">✓ Explored</span>}
                                {hiding(x) && <span className="rounded-full bg-tangerine/15 px-2 py-0.5 text-[11px] font-black text-[#BF5508]">Domi hiding</span>}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {list.length === 0 && <p className="mx-4 mt-3 rounded-[24px] bg-white p-6 text-center font-bold text-navy/60">No matches.</p>}
          <div className="h-6" />
        </section>
      </div>
      <TabBar />
    </main>
  );
}

/** Live height of an element (for stacking sticky headers). */
function useHeight(ref: React.RefObject<HTMLElement | null>) {
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    setH(el.offsetHeight);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

/** Seasonal and limited-time content (brief: "come back for something new"). */
function HappeningNow() {
  const items: { domi: Domi; live: boolean }[] = [
    ...getActiveLimitedHunts().map((d) => ({ domi: d, live: true })),
    ...getUpcomingHunts().map((d) => ({ domi: d, live: false })),
  ].filter((v, i, a) => a.findIndex((w) => w.domi.theme === v.domi.theme) === i);
  if (!items.length) return null;
  return (
    <section className="mt-8">
      <h2 className="display px-5 text-[22px]">Happening at The Tech</h2>
      <div className="scroll-x mt-3 flex gap-3 px-4 pb-2">
        {items.map(({ domi, live }) => (
          <div key={domi.theme} className={`w-[220px] shrink-0 rounded-[22px] p-4 ${live ? "bg-pink text-white shadow-[0_5px_0_#B5006A]" : "bg-white shadow-[0_4px_0_#DCE3EA]"}`}>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black ${live ? "bg-white text-pink" : "bg-gold text-navy"}`}>
              {live ? `Ends in ${daysLeft(domi)} days` : `In ${daysUntil(domi)} days`}
            </span>
            <p className="display mt-2 text-[17px] leading-tight">{domi.theme}</p>
            <p className={`mt-1 flex items-center gap-1 text-[13px] font-bold ${live ? "text-white/85" : "text-navy/60"}`}>
              <CalendarIcon size={13} />
              {domi.start_date && formatShort(domi.start_date)}
              {domi.end_date && domi.start_date?.slice(0, 10) !== domi.end_date.slice(0, 10) ? ` – ${formatShort(domi.end_date)}` : ""}
            </p>
            <p className={`mt-1 text-[13px] font-semibold ${live ? "text-white/85" : "text-navy/60"}`}>Limited-time Domi to collect</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChipRow<T extends string | number>({ label, items, value, onChange }: { label: string; items: (readonly [string, T])[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="scroll-x flex items-center gap-2 px-5" role="group" aria-label={label}>
            {items.map(([l, v]) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`h-10 shrink-0 rounded-full px-4 text-[14px] font-black ${value === v ? "bg-purple text-white" : "bg-white text-navy/70 shadow-[0_3px_0_rgba(0,0,0,.06)]"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
