"use client";
/** "Find your next stop" (project brief): 3 exhibit suggestions, each with one short reason. */
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import ExhibitThumb from "./ExhibitThumb";
import { PinIcon } from "./Icons";
import { recommend } from "@/lib/recommend";
import { update, useLocal } from "@/lib/store";
import type { VisitTime } from "@/lib/types";

const TIMES: [VisitTime, string][] = [[15, "15 min"], [30, "30 min"], [60, "1 hr+"]];

export default function NextStops() {
  const local = useLocal();
  const time = local?.visitTime ?? null;
  // Wait for on-device progress before ranking, so the list never flashes "nothing explored" picks.
  const recs = local ? recommend(local.collection, time, 3, local.checkins ?? []) : [];
  const setTime = (t: VisitTime) => update((s) => ({ ...s, visitTime: s.visitTime === t ? null : t }));

  return (
    <section id="next" className="relative mt-6 scroll-mt-[150px] px-4">
      <div className="px-1">
        <h2 className="display text-[22px]">Your next stops</h2>
      </div>

      <div className="mt-3 flex items-center gap-2 px-1" role="group" aria-label="How much time do you have?">
        <span className="mr-1 text-sm font-extrabold text-navy/70">Time left</span>
        {TIMES.map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTime(t)}
            aria-pressed={time === t}
            className={`h-11 flex-1 rounded-full text-[15px] font-black transition-colors ${time === t ? "bg-purple text-white" : "bg-white text-navy/70 shadow-[0_3px_0_rgba(0,0,0,.08)]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ol className="mt-4 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {recs.map((r, i) => (
            <motion.li
              key={r.exhibit.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link
                href={`/exhibit/${r.exhibit.id}`}
                className={`chunky flex items-center gap-3 rounded-[24px] bg-white p-3.5 ${i === 0 ? "border-[3px] border-tangerine" : ""}`}
                style={{ ["--btn-edge" as string]: i === 0 ? "#C4621A" : "#DCE3EA", borderRadius: 24 }}
              >
              <ExhibitThumb exhibit={r.exhibit} hidden={r.hidesDomi} />
              <div className="min-w-0 flex-1">
                {i === 0 && <p className="text-[11px] font-black uppercase tracking-[0.14em] text-tangerine">Top pick</p>}
                <p className="display text-[18px] leading-tight">{r.exhibit.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] font-bold text-navy/60">
                  <PinIcon size={13} /> {r.exhibit.location}
                </p>
                <p className="mt-1 truncate text-[14px] font-black text-purple">{r.reason}</p>
              </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
        {local && recs.length === 0 && (
          <li className="rounded-[24px] bg-white p-4 text-center font-bold text-navy/60">Nothing fits. Try more time.</li>
        )}
      </ol>
    </section>
  );
}
