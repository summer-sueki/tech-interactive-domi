"use client";
/** Exhibit detail + "I explored this" check-in (project brief, Release 1). */
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Domi from "@/components/Domi";
import Button from "@/components/Button";
import Sheet from "@/components/Sheet";
import { TOPIC_COLOR } from "@/components/ExhibitThumb";
import { Hills, Sparkles } from "@/components/Scenery";
import { BackIcon, SparkIcon } from "@/components/Icons";
import { EXHIBITS, getExhibit } from "@/data/exhibits";
import { formatDate, getDomiBySlug, isAvailable } from "@/lib/data";
import CollectSheet from "@/components/CollectSheet";
import { getVisits } from "@/lib/recommend";
import { checkIn, useLocal } from "@/lib/store";

export default function ExhibitDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const local = useLocal();
  const [celebrate, setCelebrate] = useState(false);
  const [collect, setCollect] = useState(false);
  const x = getExhibit(id);
  if (!x) notFound();

  const color = TOPIC_COLOR[x.topic];
  const visits = getVisits(local?.collection ?? [], local?.checkins ?? []);
  const visit = visits.find((v) => v.exhibit.id === x.id);
  const domi = x.domi_slug ? getDomiBySlug(x.domi_slug) : undefined;
  const domiFound = !!domi && (local?.collection ?? []).some((c) => c.domi_id === domi.id);

  // "I explored this" records the visit; collecting the Domi is its own clear step ("I found the Domi!").
  const explore = () => {
    checkIn(x.id);
    setCelebrate(true);
  };
  const canCollect = !!domi && !domiFound && isAvailable(domi);

  return (
    <main className="relative h-dvh overflow-hidden bg-offwhite">
      <div className="h-full overflow-y-auto pb-[120px]">
        {/* Illustrated hero (photo placeholder) */}
        <section className="relative h-[250px] overflow-hidden" style={{ background: `linear-gradient(180deg, ${color} 0%, ${color}99 60%, #CFF0C1 100%)` }}>
          <Sparkles count={8} color="#fff" seed={x.minutes} />
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15" />
          {x.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={x.image} alt={x.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="display absolute right-8 top-16 text-[110px] leading-none text-white/25">{x.topic[0]}</span>
          )}
          {!x.image && <Hills height={110} />}
          <div className="pt-safe relative z-10 px-4">
            <button onClick={() => (history.length > 1 ? router.back() : router.push("/explore"))} aria-label="Back" className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-navy shadow-[0_3px_0_rgba(0,0,0,.12)]">
              <BackIcon />
            </button>
          </div>
          {!x.image && <span className="absolute bottom-10 right-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white">Photo coming soon</span>}
          {x.closed && <span className="absolute bottom-10 left-4 rounded-full bg-navy px-3 py-1 text-[13px] font-black text-white">Closed today</span>}
        </section>

        <section className="relative z-10 -mt-6 rounded-t-[32px] bg-offwhite px-5 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {[x.topic, x.location, x.ages ? (x.ages === "All ages" ? x.ages : `Ages ${x.ages}`) : null, `~${x.minutes} min`, x.type].filter(Boolean).map((t) => (
              <span key={t} className="rounded-full bg-white px-3 py-1 text-[13px] font-black text-navy/70 shadow-[0_2px_0_rgba(0,0,0,.05)]">{t}</span>
            ))}
          </div>
          <h1 className="display mt-3 text-[32px] leading-tight">{x.name}</h1>
          <p className="mt-2 text-[17px] font-semibold leading-snug text-navy/75">{x.description}</p>

          {domi && !x.closed && (
            <div className="mt-5 flex items-center gap-3 rounded-[20px] border-[3px] border-[#E9C987] bg-paper py-2.5 pl-3 pr-2.5 shadow-[0_3px_0_#D9B46A]">
              <div className="relative shrink-0">
                <Domi domi={domi} size={40} silhouette={!domiFound} tappable={false} shadow={false} pose={domiFound ? "idle" : "still"} />
                {!domiFound && <span className="display absolute left-1/2 top-[22%] -translate-x-1/2 text-sm text-white">?</span>}
              </div>
              {domiFound ? (
                <p className="min-w-0 flex-1 text-[15px] font-bold">You found <Link href={`/domi/${domi.slug}`} className="font-black text-purple underline">{domi.name}</Link> here!</p>
              ) : (
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[15px] font-black">Domi hiding here!</p>
                  <p className="text-[13px] font-bold text-navy/60">Look for its sign</p>
                </div>
              )}
              {canCollect && (
                <button
                  onClick={() => setCollect(true)}
                  className="chunky h-10 shrink-0 rounded-full bg-tangerine px-4 text-[14px] text-white"
                  style={{ ["--btn-edge" as string]: "#C4621A", borderRadius: 999 }}
                >
                  Found it!
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Check-in bar */}
      <div className="pb-safe absolute inset-x-0 bottom-0 z-20 border-t-2 border-black/5 bg-white/95 px-5 pt-3 backdrop-blur">
        {x.closed ? (
          <p className="pb-4 pt-1 text-center font-black text-navy/60">Closed today. Check back soon!</p>
        ) : visit ? (
          <div className="flex items-center justify-between pb-3">
            <p className="flex items-center gap-2 font-black text-[#0E8840]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-green text-white">✓</span>
              Explored {formatDate(visit.at)}
            </p>
            <Link href="/explore#next" className="font-black text-purple">Next stop ›</Link>
          </div>
        ) : (
          <div className="pb-3"><Button color="purple" onClick={explore}>I explored this</Button></div>
        )}
      </div>

      <Sheet open={celebrate} onClose={() => setCelebrate(false)}>
        <div className="flex flex-col items-center pb-4 text-center">
          <h2 className="display text-[30px]">Nice exploring!</h2>
          <motion.div initial={{ scale: 0.4, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}>
            <Domi domi={getDomiBySlug("classic")} size={120} pose="wave" />
          </motion.div>
          <div className="mt-2 w-full">
            <div className="h-3 w-full overflow-hidden rounded-full bg-offwhite">
              <motion.div className="h-full rounded-full bg-green" initial={{ width: `${((visits.length - 1) / EXHIBITS.length) * 100}%` }} animate={{ width: `${(visits.length / EXHIBITS.length) * 100}%` }} transition={{ delay: 0.3, type: "spring" }} />
            </div>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-sm font-black text-navy/70"><SparkIcon size={12} className="text-gold" /> {visits.length} of {EXHIBITS.length} explored</p>
          </div>
          <div className="mt-4 w-full space-y-3">
            <Button color="purple" href="/explore#next">Find my next stop</Button>
            {canCollect ? (
              <Button color="tangerine" variant="secondary" onClick={() => { setCelebrate(false); setCollect(true); }}>I found the Domi!</Button>
            ) : (
              <Button color="purple" variant="secondary" href="/my-domis">See My Domis</Button>
            )}
          </div>
        </div>
      </Sheet>
      <CollectSheet open={collect} onClose={() => setCollect(false)} domi={domi} where={x.name} />
    </main>
  );
}
