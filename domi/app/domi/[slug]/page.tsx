"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import Domi from "@/components/Domi";
import Button from "@/components/Button";
import { Hills, Sparkles } from "@/components/Scenery";
import { BackIcon, CalendarIcon, PinIcon, SparkIcon } from "@/components/Icons";
import { formatDate, getDomiBySlug, getDomis, statusOf } from "@/lib/data";
import { useLocal } from "@/lib/store";

export default function DomiDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const local = useLocal();
  const domi = getDomiBySlug(slug);
  if (!domi) notFound();
  const collection = local?.collection ?? [];
  const entry = collection.find((c) => c.domi_id === domi.id);
  const status = statusOf(domi, collection);
  const all = getDomis();
  const order = [...collection].sort((a, b) => +new Date(a.found_at) - +new Date(b.found_at)).findIndex((c) => c.domi_id === domi.id) + 1;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-offwhite">
      {/* Themed scene */}
      <section className="relative h-[54dvh] min-h-[380px] overflow-hidden" style={{ background: `linear-gradient(180deg, ${domi.color} 0%, ${domi.color}AA 55%, #CFF0C1 100%)` }}>
        <Sparkles count={9} color="#fff" seed={Number(domi.id.slice(1))} />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/15" />
        <div className="absolute -right-16 top-24 h-40 w-40 rounded-full bg-white/10" />
        <Hills height={150} />
        <div className="pt-safe relative z-10 flex items-center justify-between px-4">
          <button onClick={() => (history.length > 1 ? router.back() : router.push("/my-domis"))} className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-navy shadow-[0_3px_0_rgba(0,0,0,.12)]" aria-label="Back">
            <BackIcon />
          </button>
          {entry && <span className="rounded-full bg-white/90 px-3 py-2 text-sm font-black">#{order} of {all.length}</span>}
        </div>
        <motion.div
          className="absolute bottom-[34px] left-1/2 -translate-x-1/2"
          initial={{ y: 60, scale: 0.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 240, damping: 13 }}
        >
          <Domi domi={domi} size={190} silhouette={!entry} glow={status === "new"} />
        </motion.div>
      </section>

      <section className="relative z-10 -mt-6 rounded-t-[32px] bg-offwhite px-5 pb-10 pt-6">
        {entry ? (
          <>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-purple">{domi.unlock_type === "special" ? "Special Domi" : domi.unlock_type === "event" ? "Event Domi" : "Exhibit Domi"}</p>
            <h1 className="display text-[34px] leading-tight">{domi.name}</h1>
            <p className="mt-2 text-[17px] font-semibold text-navy/75">{domi.description}</p>

            <div className="relative mt-5 rotate-[-1deg] rounded-[24px] border-[3px] border-[#E9C987] bg-paper p-5 shadow-[0_5px_0_#D9B46A]">
              <p className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-tangerine"><SparkIcon size={12} /> Memory</p>
              <ul className="mt-3 space-y-3 text-[16px] font-bold">
                <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-tangerine"><PinIcon size={20} /></span> Found at {entry.location}</li>
                <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-cobalt"><CalendarIcon size={20} /></span> {formatDate(entry.found_at)}</li>
                <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-purple"><SparkIcon size={18} /></span> {domi.theme}</li>
              </ul>
            </div>
            <div className="mt-6"><Button href="/my-domis" color="purple" variant="secondary">Back to my field</Button></div>
          </>
        ) : (
          <>
            <h1 className="display text-[34px] leading-tight">Still hiding...</h1>
            <p className="mt-2 text-[17px] font-semibold text-navy/75">{domi.location_hint}</p>
            <div className="mt-6"><Button href="/explore" color="tangerine">Find it in Explore</Button></div>
            <Link href="/my-domis" className="mt-4 block text-center font-black text-purple">Back to My Domis</Link>
          </>
        )}
      </section>
    </main>
  );
}
