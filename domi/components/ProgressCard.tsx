"use client";
/** Signed-in progress: how much of the museum you've explored and how many Domis are left. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXHIBITS } from "@/data/exhibits";
import Domi from "./Domi";
import { getDomiBySlug, getDomis } from "@/lib/data";
import { getVisits } from "@/lib/recommend";
import { isLoggedIn, useLocal } from "@/lib/store";

export default function ProgressCard() {
  const local = useLocal();
  const path = usePathname();
  if (!local) return null;
  if (!isLoggedIn(local)) {
    return (
      <div className="mx-4 flex items-center gap-3 rounded-[24px] bg-purple-light/50 p-4 shadow-[0_4px_0_#E3C6EC]">
        <div className="-my-2 shrink-0"><Domi domi={getDomiBySlug("happy")} size={48} pose="wave" shadow={false} tappable={false} /></div>
        <div className="min-w-0 flex-1">
          <p className="display text-[17px] leading-tight">Don&apos;t let them wander off!</p>
          <p className="text-[13px] font-bold text-navy/60">Sign in to keep your Domis forever.</p>
        </div>
        <Link href={`/save?mode=login&next=${encodeURIComponent(path)}`} className="chunky shrink-0 rounded-full bg-purple px-4 py-2.5 text-sm font-black text-white" style={{ ["--btn-edge" as string]: "#5C2470", borderRadius: 999 }}>Sign in</Link>
      </div>
    );
  }
  const explored = getVisits(local.collection, local.checkins ?? []).length;
  const all = getDomis();
  const owned = new Set(local.collection.map((c) => c.domi_id));
  const left = all.length - owned.size;
  const pct = Math.round((explored / EXHIBITS.length) * 100);
  return (
    <div className="mx-4 grid grid-cols-2 gap-3" aria-label="Your progress">
      <Stat
        color="#0088CE" label="Museum explored" big={`${pct}%`} sub={`${explored} of ${EXHIBITS.length} exhibits`} value={explored / EXHIBITS.length}
      />
      <Stat
        color="#7F3896" label="Domis left" big={`${left}`} sub={`${owned.size} of ${all.length} collected`} value={owned.size / all.length}
      />
    </div>
  );
}

function Stat({ color, label, big, sub, value }: { color: string; label: string; big: string; sub: string; value: number }) {
  return (
    <div className="rounded-[22px] bg-white p-3.5 shadow-[0_4px_0_#DCE3EA]">
      <p className="text-[11px] font-black uppercase tracking-[0.12em]" style={{ color }}>{label}</p>
      <p className="display mt-0.5 text-[30px] leading-none">{big}</p>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-offwhite">
        <div className="h-full rounded-full" style={{ width: `${Math.max(4, value * 100)}%`, background: color }} />
      </div>
      <p className="mt-1.5 text-[12px] font-bold leading-tight text-navy/60">{sub}</p>
    </div>
  );
}
