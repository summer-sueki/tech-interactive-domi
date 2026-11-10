"use client";
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Domi, { type Pose } from "@/components/Domi";
import Button from "@/components/Button";
import { Hills, Starfield } from "@/components/Scenery";
import { CalendarIcon, PinIcon } from "@/components/Icons";
import DomiSign from "@/components/DomiSign";
import { TapRipple } from "@/components/CollectSheet";
import { formatDate, getDomiById, getDomis, now, resolveCode } from "@/lib/data";
import { addToCollection, getLocal, isLoggedIn } from "@/lib/store";
import type { Domi as DomiData } from "@/lib/types";

type Outcome =
  | { kind: "new"; domi: DomiData; number: number; foundAt: string }
  | { kind: "already"; domi: DomiData }
  | { kind: "invalid" }
  | { kind: "expired"; domi?: DomiData }
  | { kind: "not-yet"; domi: DomiData }
  | { kind: "offline" };

export default function FoundPage() {
  return (
    <Suspense>
      <Found />
    </Suspense>
  );
}

function Found() {
  const { code } = useParams<{ code: string }>();
  const params = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (params.get("state") === "offline" || (typeof navigator !== "undefined" && !navigator.onLine)) {
      setOutcome({ kind: "offline" });
      return;
    }
    const r = resolveCode(code);
    if (r.kind !== "ok") { setOutcome(r); return; }
    const local = getLocal();
    const existing = local.collection.find((c) => c.domi_id === r.domi.id);
    // Found seconds ago = this same scan (e.g. a dev-mode remount), so still show the reveal.
    if (existing && now().getTime() - new Date(existing.found_at).getTime() < 15_000) {
      setOutcome({ kind: "new", domi: r.domi, number: local.collection.indexOf(existing) + 1, foundAt: existing.found_at });
      return;
    }
    if (existing) { setOutcome({ kind: "already", domi: r.domi }); return; }
    addToCollection(r.domi.id, r.domi.theme);
    setOutcome({ kind: "new", domi: r.domi, number: getLocal().collection.length, foundAt: now().toISOString() });
  }, [code, params]);

  if (!outcome) return <main className="h-dvh bg-night" />;
  const via = params.get("via");
  if (outcome.kind === "new") return <Reveal domi={outcome.domi} number={outcome.number} foundAt={outcome.foundAt} via={via === "nfc" || via === "qr" ? via : null} />;
  return <EdgeState outcome={outcome} />;
}

/* ───────────── The pop-out reveal ───────────── */

/**
 * via = "nfc": the top of the phone just touched the tag, so the Domi squeezes in through a slot in
 * the middle third of the top edge (stretched thin), springs back into shape, then floats in space.
 * via = "qr": it floats out of the QR code on the sign. No via (plain link): it bursts out of a portal.
 */
function Reveal({ domi, number, foundAt, via }: { domi: DomiData; number: number; foundAt: string; via: "nfc" | "qr" | null }) {
  const router = useRouter();
  const reduce = useReducedMotionConfig();
  const [step, setStep] = useState(reduce ? 5 : 0);
  const [pose, setPose] = useState<Pose>(reduce ? "still" : "still");
  const [released, setReleased] = useState(!!reduce);
  const total = getDomis().length;

  useEffect(() => {
    if (reduce) return;
    // NFC: squeeze through the slot (0.15–1.1s), then let go so it springs back into shape.
    const r = via === "nfc" ? setTimeout(() => setReleased(true), 1100) : undefined;
    const t = (via === "nfc"
      ? [150, 1700, 1800, 2500, 3000] // squeeze, spring, float
      : via === "qr"
      ? [500, 1500, 2250, 2850, 3350] // floats up from the sign
      : [700, 1150, 1650, 2300, 2800]
    ).map((ms, i) => setTimeout(() => { setStep(i + 1); if (i === 2) setPose(via === "nfc" ? "idle" : "land"); }, ms));
    return () => { t.forEach(clearTimeout); clearTimeout(r); };
  }, [reduce, via]);

  const next = () => {
    const local = getLocal();
    // User flow: logged in → My Domis; not logged in → Log in / Sign up right after collecting.
    const dest = `/my-domis?new=${domi.slug}`;
    router.push(isLoggedIn(local) ? dest : `/save?next=${encodeURIComponent(dest)}`);
  };

  return (
    <main className={`relative h-dvh overflow-hidden bg-gradient-to-b text-white ${via === "nfc" ? "from-night-2 via-[#5B3A9E] to-[#B35BCB]" : "from-night via-night-2 to-[#5B4BC4]"}`}>
      <Starfield count={70} />

      {via === "nfc" && <SpaceDrift />}

      {/* NFC: the slot the Domi squeezes through, the middle third of the top edge (where the tag touched) */}
      {via === "nfc" && (
        <motion.div
          className="absolute left-1/3 top-0 z-30 h-[36px] w-1/3 -translate-y-1/2 rounded-full bg-[#140F3A] shadow-[0_0_0_3px_rgba(159,230,255,.9),0_0_26px_8px_rgba(159,230,255,.55)]"
          initial={{ scaleY: 0, scaleX: 0.6, opacity: 0 }}
          animate={
            step < 1 ? {}
            : !released ? { scaleY: [0, 1, 1.9, 1.6], scaleX: [0.6, 1, 1.08, 1.04], opacity: 1 }
            : step < 3 ? { scaleY: 1, scaleX: 1, opacity: 1 }
            : { scaleY: 0, scaleX: 0.7, opacity: 0 }
          }
          transition={!released ? { duration: 0.95, times: [0, 0.2, 0.7, 1] } : { type: "spring", stiffness: 500, damping: 12 }}
          aria-hidden
        />
      )}

      {/* Collection slots */}
      <motion.div className="pt-safe relative z-10 px-4" initial={false} animate={{ opacity: via === "nfc" && step < 2 ? 0 : 1 }}>
        <Slots newId={domi.id} popped={step >= 4} />
      </motion.div>

      {/* Title */}
      <div className="relative z-10 mt-4 h-[70px] text-center">
        {step >= 2 && (
          <motion.h1
            className="glitch display text-[44px] leading-none"
            data-text="YOU FOUND ME!"
            initial={{ opacity: 0, scale: 1.6, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
          >
            YOU FOUND ME!
          </motion.h1>
        )}
      </div>

      {/* The sign the phone just tapped / scanned: the Domi comes out of it */}
      {via === "qr" && (
        <motion.div
          className="absolute inset-x-0 top-[62%] z-0 flex -translate-y-1/2 justify-center"
          animate={step >= 4 ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <DomiSign width={190} />
            <TapRipple active className="left-[71%] top-[50%]" />
            {<motion.span className="absolute inset-0 rounded-[18px] bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
          </div>
        </motion.div>
      )}

      {/* Portal / float + Domi */}
      <div className="absolute inset-x-0 top-[34%] flex justify-center">
        {!via && <Portal open={step >= 0} />}
        <Confetti go={step >= 3 && !reduce} />
        {/* Pinned to the exact centre of the screen; the float sways evenly around it */}
        <div className="absolute left-1/2 top-[-130px] w-[170px] -translate-x-1/2">
          {step >= 1 && !reduce && !via && <Trail domi={domi} />}
          {step >= 1 && !reduce && via === "qr" && <Rise from={40} />}
          {via === "nfc" ? (
            // 1) Squeeze: stretched thin and tall, it pushes down through the slot (the screen edge hides the rest).
            // 2) Release: springs back to its shape with a wobbly overshoot.
            // 3) Float: drifts and bobs in space.
            <motion.div
              style={{ originY: 0 }}
              initial={reduce ? false : { y: "-64vh", scaleX: 0.62, scaleY: 1.75 }}
              animate={
                step < 1 ? {}
                : !released ? { y: "-20vh", scaleX: 0.62, scaleY: 1.75 }
                : { y: 56, scaleX: 1, scaleY: 1 }
              }
              transition={
                !released
                  ? { duration: 0.95, ease: [0.45, 0, 0.25, 1] }
                  : { y: { type: "spring", stiffness: 90, damping: 9, mass: 1 }, scaleX: { type: "spring", stiffness: 260, damping: 6 }, scaleY: { type: "spring", stiffness: 260, damping: 6 } }
              }
            >
              <motion.div
                className="relative"
                animate={released && !reduce ? { y: [0, -14, 0, 10, 0], x: [0, 5, 0, -5, 0], rotate: [0, 2.5, 0, -2.5, 0] } : {}}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                {/* Soft halo centred behind it, so it reads as floating in the middle of space */}
                <motion.span
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(159,230,255,.45)_0%,_rgba(159,230,255,0)_65%)]"
                  initial={{ opacity: 0 }} animate={{ opacity: released ? 1 : 0 }} transition={{ duration: 0.6 }} aria-hidden
                />
                <div className="relative flex justify-center"><Domi domi={domi} size={170} pose={pose} glow={released} shadow={false} /></div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={reduce ? false : via ? { y: "30vh", x: 40, scale: 0.12, opacity: 0 } : { y: 150, scale: 0.2, opacity: 0 }}
              animate={
                step < 1 ? {}
                : via ? { y: ["30vh", "-3vh", "0vh"], x: [40, 12, 0], scale: [0.12, 0.85, 1], rotate: [0, -8, 0], opacity: [0, 1, 1] }
                : { y: [150, -120, 0], scale: [0.2, 1.05, 1], opacity: 1 }
              }
              transition={via ? { duration: 1.7, times: [0, 0.7, 1], ease: "easeOut" } : { duration: 0.95, times: [0, 0.55, 1], ease: [0.2, 0.9, 0.3, 1] }}
            >
              <Domi domi={domi} size={170} pose={pose} glow={(step >= 1 && !!via) || step >= 3} onLanded={() => setPose("wave")} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Card */}
      <AnimatePresence>
        {step >= 5 && (
          <motion.section
            className="pb-safe absolute inset-x-0 bottom-0 z-20 rounded-t-[32px] bg-white px-5 pt-5 text-navy"
            initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-purple">New Domi</p>
                <h2 className="display text-[30px] leading-tight">{domi.name}</h2>
              </div>
              <span className="mt-1 shrink-0 rounded-full bg-gold px-3 py-1.5 text-sm font-black">#{number} of {total}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-navy/70">
              <span className="flex items-center gap-1 rounded-full bg-offwhite px-3 py-1.5"><PinIcon size={16} /> {domi.theme}</span>
              <span className="flex items-center gap-1 rounded-full bg-offwhite px-3 py-1.5"><CalendarIcon size={16} /> {formatDate(foundAt)}</span>
            </div>
            <div className="mt-5 pb-4"><Button onClick={next} color="purple">Add to My Domis</Button></div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

/** Stars streaming slowly past, so the Domi looks like it's floating through space. */
function SpaceDrift() {
  const stars = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ x: (i * 37) % 100, s: 1.5 + (i % 4), d: 7 + ((i * 13) % 9), o: -((i * 29) % 14), a: 0.35 + (i % 3) * 0.2 })), []);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-white"
          style={{ left: `${st.x}%`, width: st.s, height: st.s * (st.s > 3 ? 3 : 1), opacity: st.a, animation: `star-drift ${st.d}s linear ${st.o}s infinite` }}
        />
      ))}
    </div>
  );
}

/** Sparkles drifting up from the sign along the Domi's path. */
function Rise({ from }: { from: number }) {
  const bits = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ dx: ((i * 37) % 60) - 30, d: (i % 7) * 0.09, s: 6 + (i % 3) * 3, c: ["#FED602", "#FFFFFF", "#9FE6FF"][i % 3] })), []);
  return (
    <div className="pointer-events-none absolute left-1/2 top-[60%]" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: b.s, height: b.s, background: b.c, boxShadow: `0 0 8px ${b.c}` }}
          initial={{ x: from + b.dx * 0.3, y: "30vh", opacity: 0 }}
          animate={{ x: from * 0.2 + b.dx, y: ["30vh", "-6vh"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: b.d, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Portal({ open }: { open: boolean }) {
  return (
    <motion.div
      className="relative h-[110px] w-[260px]"
      initial={{ scale: 0, opacity: 0 }}
      animate={open ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 180, damping: 12 }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-[50%] border-[3px] border-[#9FE6FF]"
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
      <span className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse,_#FFFFFF_0%,_#9FE6FF_25%,_#6D5BFF_55%,_rgba(60,40,180,0)_72%)]" />
      <span
        className="spin absolute inset-[8%] rounded-[50%] opacity-80"
        style={{ background: "conic-gradient(from 0deg, transparent, #fff, transparent 30%, #C9A8FF, transparent 60%, #6FD3FF, transparent)", animation: "spin-slow 2.2s linear infinite", maskImage: "radial-gradient(ellipse, transparent 30%, #000 32%)", WebkitMaskImage: "radial-gradient(ellipse, transparent 30%, #000 32%)" }}
      />
    </motion.div>
  );
}

function Trail({ domi }: { domi: DomiData }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <motion.img
          key={i}
          src={domi.image ?? "/domis/domi-classic.png"}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[6%] w-[150px] -translate-x-1/2"
          initial={{ y: 150, scale: 0.2, opacity: 0 }}
          animate={{ y: [150, -120, 0], scale: [0.2, 1.05, 1], opacity: [0, 0.35 - i * 0.08, 0] }}
          transition={{ duration: 0.95, times: [0, 0.55, 1], delay: i * 0.06, ease: [0.2, 0.9, 0.3, 1] }}
          style={{ filter: "blur(2px) brightness(1.4)" }}
        />
      ))}
    </>
  );
}

function Confetti({ go }: { go: boolean }) {
  const bits = useMemo(
    () => Array.from({ length: 46 }, (_, i) => {
      const a = (i / 46) * Math.PI * 2 + (i % 3) * 0.2;
      const r = 120 + ((i * 37) % 110);
      return { x: Math.cos(a) * r, y: Math.sin(a) * r - 80, rot: (i * 47) % 360, c: ["#FED602", "#ED0289", "#6FD3FF", "#1EB14B", "#F58932", "#C9A8FF"][i % 6], w: i % 4 === 0 ? 6 : 10, star: i % 5 === 0 };
    }),
    [],
  );
  if (!go) return null;
  return (
    <div className="pointer-events-none absolute top-[-40px]" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ width: b.w, height: b.star ? b.w : 16, background: b.c, borderRadius: b.star ? 999 : 3 }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 160], rotate: b.rot + 360, opacity: [1, 1, 0], scale: 1 }}
          transition={{ duration: 1.9, ease: "easeOut", times: [0, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

function Slots({ newId, popped, dim }: { newId: string; popped: boolean; dim?: boolean }) {
  const all = getDomis();
  const found = new Set(getLocal().collection.map((c) => c.domi_id));
  return (
    <div className={`mx-auto grid max-w-[360px] grid-cols-12 gap-1.5 rounded-2xl p-2 ${dim ? "bg-navy/25" : "bg-white/10"}`} aria-label={`${found.size} of ${all.length} Domis found`}>
      {all.map((d) => {
        const isNew = d.id === newId;
        const show = found.has(d.id) && (!isNew || popped);
        return (
          <div key={d.id} className={`relative aspect-square rounded-lg ${show ? "bg-white/90" : "bg-white/10 ring-1 ring-white/20"}`}>
            {show && (
              <motion.img
                src={d.image ?? "/domis/domi-classic.png"} alt=""
                className="absolute inset-0.5 h-[calc(100%-4px)] w-[calc(100%-4px)] object-contain"
                initial={isNew ? { scale: 0, rotate: -30 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 12 }}
              />
            )}
            {isNew && popped && (
              <motion.span className="absolute inset-[-4px] rounded-xl ring-[3px] ring-gold" initial={{ opacity: 0, scale: 1.8 }} animate={{ opacity: [0, 1, 0.8], scale: 1 }} transition={{ duration: 0.5 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── Edge states ───────────── */

function EdgeState({ outcome }: { outcome: Exclude<Outcome, { kind: "new" }> }) {
  const content = {
    invalid: { pose: "shrug" as Pose, domi: getDomiById("d13"), title: "Hmm, that's not a Domi", body: "Try tapping the sign again.", cta: ["Back to Explore", "/explore"] },
    expired: { pose: "shrug" as Pose, domi: getDomiById("d13"), title: "This Domi has moved on", body: outcome.kind === "expired" && outcome.domi?.end_date ? `Only here until ${formatDate(outcome.domi.end_date)}.` : "This sign isn't active anymore.", cta: ["See what's on now", "/explore"] },
    "not-yet": { pose: "look" as Pose, domi: outcome.kind === "not-yet" ? outcome.domi : undefined, title: "Too early!", body: outcome.kind === "not-yet" && outcome.domi.start_date ? `Pops out on ${formatDate(outcome.domi.start_date)}.` : "Come back soon!", cta: ["Back to Explore", "/explore"], silhouette: true },
    already: { pose: "wave" as Pose, domi: outcome.kind === "already" ? outcome.domi : undefined, title: "You already found me!", body: "I'm in My Domis.", cta: ["Visit My Domis", outcome.kind === "already" ? `/my-domis?new=${outcome.domi.slug}` : "/my-domis"] },
    offline: { pose: "sit" as Pose, domi: getDomiById("d12"), title: "No signal...", body: "Can't reach the museum Wi-Fi. Try again in a sec.", cta: ["Try again", "reload"] },
  }[outcome.kind];

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-[#3FB2EC] to-[#CDEFFF]">
      <div className="pt-safe relative z-10 px-6 pt-10 text-center">
        <h1 className="display text-[34px] leading-tight text-white drop-shadow-[0_3px_0_rgba(0,80,130,.35)]">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-[300px] text-lg font-bold text-navy/80">{content.body}</p>
      </div>
      <div className="relative flex-1">
        <Hills height={200} />
        <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2">
          <Domi domi={content.domi} size={150} pose={content.pose} silhouette={"silhouette" in content && content.silhouette} />
          {outcome.kind === "invalid" || outcome.kind === "expired" ? (
            <motion.span className="display absolute -right-6 top-2 text-4xl text-white" animate={{ rotate: [-10, 10, -10], y: [0, -4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>?</motion.span>
          ) : null}
        </div>
      </div>
      <div className="pb-safe relative z-10 space-y-3 bg-[#5DBB46] px-5 pb-6">
        {content.cta[1] === "reload" ? (
          <Button color="purple" onClick={() => location.reload()}>{content.cta[0]}</Button>
        ) : (
          <Button color="purple" href={content.cta[1]}>{content.cta[0]}</Button>
        )}
        <Link href="/my-domis" className="block py-2 text-center font-black text-white">Go to My Domis</Link>
      </div>
    </main>
  );
}
