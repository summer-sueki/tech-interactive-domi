"use client";
/**
 * "Find your next stop" (project brief). The whole section is one callout, so the three picks read
 * as equal suggestions rather than one exhibit that looks auto-selected. Each has one short reason.
 */
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import ExhibitThumb from "./ExhibitThumb";
import { ChevronRight, PinIcon } from "./Icons";
import { recommend } from "@/lib/recommend";
import { useLocal } from "@/lib/store";

export default function NextStops() {
  const local = useLocal();
  // Wait for on-device progress before ranking, so the list never flashes "nothing explored" picks.
  const recs = local ? recommend(local.collection, null, 3, local.checkins ?? []) : [];

  return (
    <section id="next" className="relative mx-4 mt-6 scroll-mt-[150px]">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="display text-[22px] leading-tight">Your next stops</h2>
          <p className="text-[13px] font-bold text-navy/60">Picked for you. Choose any!</p>
        </div>
      </div>

      {/* One callout card holding all three picks as equal rows */}
      <ol className="mt-3 grid overflow-hidden rounded-[26px] bg-white shadow-[0_5px_0_#B9DDF1] ring-[3px] ring-[#8ED0F2] @3xl:grid-cols-3 @3xl:divide-x-2 @3xl:divide-y-0 divide-y-2 divide-offwhite">
        <AnimatePresence initial={false} mode="popLayout">
          {recs.map((r) => (
            <motion.li
              className="min-w-0"
              key={r.exhibit.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link href={`/exhibit/${r.exhibit.id}`} className="flex items-center gap-3 p-3 transition-colors active:bg-offwhite">
                <ExhibitThumb exhibit={r.exhibit} hidden={r.hidesDomi} />
                <div className="min-w-0 flex-1">
                  <p className="display text-[18px] leading-tight">{r.exhibit.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] font-bold text-navy/60">
                    <PinIcon size={13} /> {r.exhibit.location}
                  </p>
                  <p className="mt-1 truncate text-[14px] font-black text-cobalt">{r.reason}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-navy/25" />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
        {local && recs.length === 0 && (
          <li className="p-4 text-center font-bold text-navy/60">You&apos;ve seen it all. Amazing!</li>
        )}
      </ol>
    </section>
  );
}
