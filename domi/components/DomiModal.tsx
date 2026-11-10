"use client";
/**
 * A Domi's memory card as a pop-up over My Domis (tap a Domi twice in the field, or a tile in the grid).
 * Keeps you in place instead of jumping to a new page. /domi/<slug> still works for direct links.
 */
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Domi from "./Domi";
import { Sparkles } from "./Scenery";
import { CalendarIcon, CloseIcon, PinIcon, SparkIcon } from "./Icons";
import { formatDate, getDomiBySlug, getDomis, statusOf } from "@/lib/data";
import { useLocal } from "@/lib/store";

export default function DomiModal({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const local = useLocal();
  const domi = slug ? getDomiBySlug(slug) : undefined;
  const collection = local?.collection ?? [];
  const entry = domi && collection.find((c) => c.domi_id === domi.id);
  const order = domi ? [...collection].sort((a, b) => +new Date(a.found_at) - +new Date(b.found_at)).findIndex((c) => c.domi_id === domi.id) + 1 : 0;

  return (
    <AnimatePresence>
      {domi && (
        <motion.div
          key="domi-modal"
          className="absolute inset-0 z-[60] flex items-center justify-center bg-navy/50 p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal aria-label={domi.name}
            className="relative max-h-full w-full max-w-[380px] overflow-y-auto rounded-[30px] bg-offwhite shadow-2xl"
            initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[220px] overflow-hidden rounded-t-[30px]" style={{ background: `linear-gradient(180deg, ${domi.color} 0%, ${domi.color}AA 60%, #CFF0C1 100%)` }}>
              <Sparkles count={7} color="#fff" seed={Number(domi.id.slice(1))} />
              <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15" />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                {entry ? <span className="rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-black">#{order} of {getDomis().length}</span> : <span />}
                <button onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-navy shadow-[0_3px_0_rgba(0,0,0,.12)]">
                  <CloseIcon size={20} />
                </button>
              </div>
              <motion.div
                className="absolute bottom-3 left-1/2 -translate-x-1/2"
                initial={{ y: 40, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.05 }}
              >
                <Domi domi={domi} size={150} silhouette={!entry} glow={statusOf(domi, collection) === "new"} />
              </motion.div>
            </div>

            <div className="px-5 pb-5 pt-4">
              {entry ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-purple">{domi.unlock_type === "special" ? "Special Domi" : domi.unlock_type === "event" ? "Event Domi" : "Exhibit Domi"}</p>
                  <h2 className="display text-[28px] leading-tight">{domi.name}</h2>
                  <p className="mt-1 text-[15px] font-semibold text-navy/75">{domi.description}</p>
                  <div className="relative mt-4 rotate-[-1deg] rounded-[22px] border-[3px] border-[#E9C987] bg-paper p-4 shadow-[0_5px_0_#D9B46A]">
                    <p className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-tangerine"><SparkIcon size={12} /> Memory</p>
                    <ul className="mt-2.5 space-y-2.5 text-[15px] font-bold">
                      <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-tangerine"><PinIcon size={18} /></span> Found at {entry.location}</li>
                      <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-cobalt"><CalendarIcon size={18} /></span> {formatDate(entry.found_at)}</li>
                      <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-purple"><SparkIcon size={16} /></span> {domi.theme}</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="display text-[28px] leading-tight">Still hiding...</h2>
                  <p className="mt-1 text-[15px] font-semibold text-navy/75">{domi.location_hint}</p>
                  <Link href="/explore" className="chunky mt-4 flex h-12 items-center justify-center bg-tangerine text-white" style={{ ["--btn-edge" as string]: "#C4621A" }}>Find it in Explore</Link>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
