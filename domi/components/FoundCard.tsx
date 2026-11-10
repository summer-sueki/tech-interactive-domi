"use client";
/** A quiet reminder on My Domis. Collecting itself lives on the FIND button in the tab bar. */
import Domi from "./Domi";
import { getDomiBySlug } from "@/lib/data";

export default function FoundCard({ onFound, onHelp }: { onFound: () => void; onHelp: () => void }) {
  return (
    <section className="flex items-center gap-3 rounded-[22px] bg-white px-4 py-3 shadow-[0_4px_0_#DCE3EA]" aria-label="Collect a Domi">
      <div className="-my-1 shrink-0"><Domi domi={getDomiBySlug("classic")} size={44} pose="still" shadow={false} tappable={false} /></div>
      <button onClick={onFound} className="min-w-0 flex-1 text-left">
        <span className="display block text-[17px] leading-tight">Found a Domi?</span>
        <span className="block text-[13px] font-bold text-navy/60">Tap <span className="font-black text-tangerine">Find</span> below, then its sign.</span>
      </button>
      <button onClick={onHelp} className="shrink-0 rounded-full bg-offwhite px-3 py-2 text-[13px] font-black text-navy/60">How it works</button>
    </section>
  );
}
