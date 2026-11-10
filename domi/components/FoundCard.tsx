"use client";
/** The one action on My Domis: collect a Domi you spotted in the museum. */
import Domi from "./Domi";
import { getDomiBySlug } from "@/lib/data";

export default function FoundCard({ onFound, onHelp }: { onFound: () => void; onHelp: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#2B8FD6] to-[#62C1F0] px-5 pb-4 pt-5 text-white shadow-[0_6px_0_#0C70BA]" aria-label="Collect a Domi">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="display text-[26px] leading-[1.1] drop-shadow-[0_2px_0_rgba(0,60,110,.3)]">Found a Domi?</h2>
          <p className="mt-1 text-[15px] font-bold leading-snug text-white/90">Look for the Domi sign at exhibits.</p>
        </div>
        <div className="shrink-0"><Domi domi={getDomiBySlug("classic")} size={64} pose="wave" shadow={false} /></div>
      </div>
      <button
        onClick={onFound}
        className="chunky mt-4 flex h-[58px] w-full items-center justify-center bg-tangerine text-[20px] text-white"
        style={{ ["--btn-edge" as string]: "#C4621A", ["--edge" as string]: "6px" }}
      >
        I found the Domi!
      </button>
      <button onClick={onHelp} className="mt-3 block w-full py-1.5 text-center text-[14px] font-black text-white/90 underline">How it works</button>
    </section>
  );
}
