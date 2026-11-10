"use client";
import { animate, motion, useMotionValue, useReducedMotionConfig, useTransform, type AnimationPlaybackControls } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Domi, { type Pose } from "@/components/Domi";
import Bubble from "@/components/Bubble";
import Sheet from "@/components/Sheet";
import TabBar from "@/components/TabBar";
import LoginButton from "@/components/LoginButton";
import ProgressCard from "@/components/ProgressCard";
import FoundCard from "@/components/FoundCard";
import HidingSections from "@/components/HidingSections";
import CollectSheet from "@/components/CollectSheet";
import DomiModal from "@/components/DomiModal";
import Coach, { COACH_STEPS } from "@/components/Coach";
import { Clouds, DomeSkyline, Flower, Tree } from "@/components/Scenery";
import { GridIcon } from "@/components/Icons";
import { formatShort, getDomiById, getDomis, isAvailable, statusOf } from "@/lib/data";
import { update, useLocal } from "@/lib/store";
import type { Domi as DomiData, DomiStatus } from "@/lib/types";
import { EXHIBITS } from "@/data/exhibits";

const SIZE = 92;

export default function MyDomisPage() {
  return <Suspense><MyDomis /></Suspense>;
}

function MyDomis() {
  const local = useLocal();
  const params = useSearchParams();
  const newSlug = params.get("new");
  const [grid, setGrid] = useState(false);
  const [collect, setCollect] = useState(false);
  const [coach, setCoach] = useState<number | null>(null);
  const [memory, setMemory] = useState<string | null>(null);
  // First visit: walk through the page once.
  useEffect(() => {
    if (local && !local.coachSeen && coach === null) setCoach(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local?.coachSeen]);
  useEffect(() => {
    if (coach === null) return;
    document.getElementById(COACH_STEPS[coach].target)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [coach]);
  const endCoach = () => { setCoach(null); update((s) => ({ ...s, coachSeen: true })); };
  const ring = (id: string) => (coach !== null && COACH_STEPS[coach].target === id ? "ring-4 ring-gold ring-offset-2 ring-offset-offwhite" : "");
  const scroller = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  // h starts at 0 so no Domi is placed until the field is measured (otherwise they start below the grass).
  const [view, setView] = useState({ w: 390, h: 0 });
  const [pan, setPan] = useState({ at: 0, active: false });
  // True once the sheet has snapped all the way up (it then owns the screen and shows its own header buttons).
  const [atTop, setAtTop] = useState(false);
  const panTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const positions = useRef(new Map<string, { x: number; y: number; name: string }>());

  const all = getDomis();
  // For the dev "simulate" button: the next Domi you could collect right now.
  const nextToCollect = all.find((d) => isAvailable(d) && !(local?.collection ?? []).some((c) => c.domi_id === d.id) && d.image);
  const found = useMemo(
    () => (local?.collection ?? []).map((c) => getDomiById(c.domi_id)).filter(Boolean) as DomiData[],
    [local?.collection],
  );

  useLayoutEffect(() => {
    const el = scroller.current;
    const pg = page.current;
    if (!el || !pg) return;
    const measure = () => setView({ w: el.clientWidth, h: pg.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(pg);
    return () => ro.disconnect();
  }, []);

  // Scroll sideways when there are many Domis so it never feels crowded.
  const worldW = Math.max(view.w, Math.ceil(found.length / 5) * view.w * 0.9);
  // The field stays fixed behind the page. The content sheet rests at `rest`, scrolls up over the field,
  // and can be pulled down to `low`, leaving just its top edge above the tab bar so the whole field shows.
  const rest = Math.round(Math.min(Math.max(view.h * 0.56, 380), 560));
  const low = Math.max(rest, view.h - 210);
  // Domis roam the grass that's visible while the sheet rests.
  const band = { top: rest * 0.53, bottom: rest - 40 };
  const scrollable = worldW > view.w + 4;

  // Three set positions (CSS scroll snap): pulled down (scrollTop 0), resting, and all the way up.
  // Once all the way up, the sheet is taller than the screen, so its content scrolls freely.
  const upAt = low - 28;
  // Open with the sheet at its resting spot (the space above it lets you pull it down).
  // Snapping only switches on after that, so the browser can't snap to a spot from before the page was measured.
  const placed = useRef(false);
  const [snap, setSnap] = useState(false);
  useLayoutEffect(() => {
    if (placed.current || !view.h || !page.current) return;
    const el = page.current;
    el.scrollTop = low - rest;
    placed.current = true;
    requestAnimationFrame(() => { el.scrollTop = low - rest; setSnap(true); });
  }, [view.h, low, rest]);

  const onPan = (el: HTMLDivElement) => {
    const max = el.scrollWidth - el.clientWidth;
    setPan({ at: max > 0 ? el.scrollLeft / max : 0, active: true });
    clearTimeout(panTimer.current);
    panTimer.current = setTimeout(() => setPan((p) => ({ ...p, active: false })), 1100);
  };

  useEffect(() => {
    if (!newSlug || !scroller.current) return;
    const i = found.findIndex((d) => d.slug === newSlug);
    if (i >= 0) scroller.current.scrollLeft = startX(i, found.length, worldW) - view.w / 2;
  }, [newSlug, found, worldW, view.w]);

  return (
    <main className="relative h-dvh overflow-hidden bg-offwhite">
      <div
        ref={page}
        className={`pb-tabbar h-full overflow-y-auto overscroll-contain ${snap ? "snap-y snap-mandatory" : ""}`}
        onScroll={(e) => setAtTop(e.currentTarget.scrollTop >= upAt - 2)}
      >
        {/* Living field: fixed in place while the page scrolls over it */}
        <section id="coach-field" className={`sticky top-0 overflow-hidden bg-[#7FCF5A] ${ring("coach-field")}`} style={{ height: view.h || "100dvh" }}>
          {/* Sign in / settings + grid: part of the field (they stay with it and get covered when the sheet comes up) */}
          <div className="pt-safe absolute right-0 top-0 z-20 flex items-center gap-2 px-4">
            <LoginButton />
            <GridButton onClick={() => setGrid(true)} />
          </div>
          <div ref={scroller} onScroll={(e) => onPan(e.currentTarget)} className="scroll-x absolute inset-0 isolate overflow-y-hidden">
            <div className="relative h-full" style={{ width: worldW }}>
              <World width={worldW} height={view.h} rest={rest} />
              {view.h > 0 &&
                found.map((d, i) => (
                  <Wanderer
                    key={d.id}
                    domi={d}
                    index={i}
                    start={{ x: startX(i, found.length, worldW), y: band.top + ((i * 53) % Math.max(1, band.bottom - band.top)) }}
                    bounds={{ left: 50, right: worldW - 50, top: band.top, bottom: band.bottom }}
                    isNew={d.slug === newSlug}
                    positions={positions.current}
                    onOpen={() => setMemory(d.slug)}
                  />
                ))}
              {found.length === 0 && (
                <div className="absolute inset-x-0 px-10 text-center" style={{ top: rest * 0.38 }}>
                  <p className="display text-2xl text-white drop-shadow">Your field is empty.</p>
                  <p className="mt-1 font-black text-navy/70">Tap Find to collect your first one!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content sheet: overlaps the field. The see-through space above it passes touches to the field. */}
        <div className="pointer-events-none relative z-10" style={{ marginTop: -(view.h || 0) }}>
          {/* Snap points: pulled down, resting. (The sheet itself is the third: all the way up.) */}
          <div className="absolute inset-x-0 top-0 h-px snap-start" aria-hidden />
          <div className="absolute inset-x-0 h-px snap-start" style={{ top: low - rest }} aria-hidden />
          <div style={{ height: upAt }} />
          <div
            className={`pointer-events-auto relative snap-start bg-offwhite shadow-[0_-8px_24px_-12px_rgba(0,40,80,.35)] transition-[border-radius] duration-200 ${atTop ? "rounded-none" : "rounded-t-[32px]"}`}
            style={{ minHeight: view.h ? view.h + 1 : undefined }}
          >
            {/* Sheet header: built into the page. Once the sheet is all the way up it pins to the top with the buttons. */}
            <div className={`sticky top-0 z-20 flex items-center justify-between gap-3 bg-offwhite px-5 pb-2 transition-[padding] duration-200 ${atTop ? "pt-safe shadow-[0_6px_12px_-10px_rgba(0,40,80,.35)]" : "rounded-t-[32px] pt-4"}`}>
              <h1 className="display text-[22px] leading-none">My Domis <span className="text-[15px] font-black text-navy/45">{found.length}</span></h1>
              <div className={`flex items-center gap-2 transition-opacity duration-200 ${atTop ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!atTop}>
                <LoginButton />
                <GridButton onClick={() => setGrid(true)} />
              </div>
            </div>
            {/* Sideways scroll indicator for the field, sitting on the sheet's top edge */}
            {scrollable && (
              <div className={`pointer-events-none absolute -top-5 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-black/15 transition-opacity duration-300 ${pan.active ? "opacity-100" : "opacity-60"}`} aria-hidden>
                <span
                  className="absolute top-0 h-full rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)]"
                  style={{ width: `${Math.max(18, (view.w / worldW) * 100)}%`, left: `${pan.at * (100 - Math.max(18, (view.w / worldW) * 100))}%` }}
                />
              </div>
            )}
            <div className="space-y-5 pt-2">
              <div id="coach-found" className={`mx-4 rounded-[28px] ${ring("coach-found")}`}>
                <FoundCard onFound={() => setCollect(true)} onHelp={() => setCoach(0)} />
              </div>
              <ProgressCard />
            </div>
            <HidingSections />
          </div>
        </div>
      </div>

      <TabBar />
      <GridSheet open={grid} onClose={() => setGrid(false)} onOpen={setMemory} />
      <CollectSheet open={collect} onClose={() => setCollect(false)} domi={nextToCollect} />
      <DomiModal slug={memory} onClose={() => setMemory(null)} />
      <Coach step={coach} onNext={() => (coach !== null && coach < COACH_STEPS.length - 1 ? setCoach(coach + 1) : endCoach())} onSkip={endCoach} />
    </main>
  );
}

function GridButton({ onClick, small }: { onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`chunky grid place-items-center bg-white text-purple ${small ? "h-10 w-10" : "h-12 w-12"}`}
      style={{ ["--btn-edge" as string]: "#EBD3F2", borderRadius: small ? 14 : 16 }}
      aria-label="Open collection grid"
    >
      <GridIcon size={small ? 20 : 24} />
    </button>
  );
}

function startX(i: number, n: number, w: number) {
  const cols = Math.max(n, 1);
  return 60 + ((i + 0.5) / cols) * (w - 120);
}

/* ───────────── Background world ───────────── */

function World({ width, height, rest }: { width: number; height: number; rest: number }) {
  // Sky and path are laid out for the area above the resting sheet; the grass runs on below it.
  const ground = rest * 0.42;
  const trees = Math.max(2, Math.round(width / 180));
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#3FB2EC] to-[#BDEBFF]" style={{ height: ground + 40 }} />
      <Clouds count={Math.max(3, Math.round(width / 260))} top={70} spread={ground - 120} />
      {Array.from({ length: Math.max(1, Math.round(width / 600)) }).map((_, i) => (
        <div key={i} className="absolute" style={{ left: 60 + i * 600, top: ground - 78 }}><DomeSkyline width={170} /></div>
      ))}
      <svg className="absolute left-0" style={{ top: ground - 30 }} width={width} height={height - ground + 30} viewBox={`0 0 ${width} ${height - ground + 30}`} preserveAspectRatio="none">
        <path d={hillPath(width, 40, 30)} fill="#A8E07E" />
        <rect y="40" width={width} height={height} fill="#7FCF5A" />
        <path d={`M -20 ${rest * 0.42} C ${width * 0.25} ${rest * 0.25}, ${width * 0.5} ${rest * 0.5}, ${width * 0.75} ${rest * 0.33} S ${width + 40} ${rest * 0.4}, ${width + 40} ${rest * 0.4}`} stroke="#F1E0B0" strokeWidth="34" fill="none" strokeLinecap="round" />
      </svg>
      {Array.from({ length: trees }).map((_, i) => (
        <div key={i} className="absolute" style={{ left: (i + 0.3) * (width / trees), top: ground - 50 + (i % 2) * 10 }}>
          <Tree size={38 + (i % 3) * 8} color={i % 2 ? "#2E9E4A" : "#3BAA52"} />
        </div>
      ))}
      {Array.from({ length: Math.round(width / 50) }).map((_, i) => (
        <div key={i} className="absolute" style={{ left: (i * 97) % width, top: ground + 40 + ((i * 131) % Math.max(1, height - ground - 170)) }}>
          <Flower size={12 + (i % 3) * 3} color={["#ED0289", "#FED602", "#fff", "#F58932"][i % 4]} />
        </div>
      ))}
    </div>
  );
}

function hillPath(w: number, base: number, amp: number) {
  let d = `M 0 ${base}`;
  const step = 220;
  for (let x = 0; x < w + step; x += step) d += ` Q ${x + step / 2} ${base - amp * ((x / step) % 2 ? 0.6 : 1.2)} ${x + step} ${base}`;
  return d + ` V 400 H 0 Z`;
}

/* ───────────── A wandering, draggable Domi ───────────── */

interface WandererProps {
  domi: DomiData;
  index: number;
  start: { x: number; y: number };
  bounds: { left: number; right: number; top: number; bottom: number };
  isNew: boolean;
  positions: Map<string, { x: number; y: number; name: string }>;
  onOpen: () => void;
}

function Wanderer({ domi, index, start, bounds, isNew, positions, onOpen }: WandererProps) {
  const reduce = useReducedMotionConfig();
  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const z = useTransform(y, (v) => Math.round(v));
  const [pose, setPose] = useState<Pose>("idle");
  const [facing, setFacing] = useState<1 | -1>(1);
  const [bubble, setBubble] = useState<string | null>(null);
  // A just-collected Domi drops out of the sky onto the grass.
  const falling = useRef(isNew && !reduce);
  const [shadowIn, setShadowIn] = useState(!falling.current);
  const anims = useRef<AnimationPlaybackControls[]>([]);
  const [dust, setDust] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragging = useRef(false);
  const justDragged = useRef(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stop = () => { anims.current.forEach((a) => a.stop()); anims.current = []; clearTimeout(timer.current); };

  const showBubble = useCallback((text: string, ms = 2600) => {
    setBubble(text);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);

  const schedule = useCallback(function next(delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (dragging.current) return;
      const me = { x: x.get(), y: y.get() };
      positions.set(domi.id, { ...me, name: domi.name });
      const near = [...positions.entries()].find(([id, p]) => id !== domi.id && Math.hypot(p.x - me.x, p.y - me.y) < 150);
      const roll = Math.random();
      if (near && roll < 0.25) {
        setFacing(near[1].x < me.x ? -1 : 1);
        setPose("wave");
        showBubble(`Hi ${near[1].name.replace(" Domi", "")}!`, 1800);
        timer.current = setTimeout(() => { setPose("idle"); next(1500 + Math.random() * 2000); }, 2200);
        return;
      }
      if (roll < 0.35) { setPose("look"); timer.current = setTimeout(() => { setPose("idle"); next(1200); }, 2400); return; }
      if (roll < 0.45) { setPose("sit"); timer.current = setTimeout(() => { setPose("idle"); next(800); }, 3000 + Math.random() * 3000); return; }
      // Walk somewhere nearby.
      const tx = clamp(me.x + (Math.random() - 0.5) * 320, bounds.left, bounds.right);
      const ty = clamp(me.y + (Math.random() - 0.5) * 160, bounds.top, bounds.bottom);
      const dist = Math.hypot(tx - me.x, ty - me.y);
      const duration = Math.max(1, dist / 45);
      setFacing(tx < me.x ? -1 : 1);
      setPose("walk");
      anims.current = [
        animate(x, tx, { duration, ease: "linear" }),
        animate(y, ty, { duration, ease: "linear" }),
      ];
      timer.current = setTimeout(() => { setPose("idle"); positions.set(domi.id, { x: tx, y: ty, name: domi.name }); next(1500 + Math.random() * 3000); }, duration * 1000);
    }, delay);
  }, [x, y, bounds.left, bounds.right, bounds.top, bounds.bottom, domi.id, domi.name, positions, showBubble]);

  useEffect(() => {
    positions.set(domi.id, { x: start.x, y: start.y, name: domi.name });
    if (reduce) { if (isNew) showBubble(`Hi! I'm ${domi.name}`, 3200); return; }
    if (falling.current) {
      // Wait a beat, then fall with gravity (ease-in) and squash on landing.
      y.set(-60);
      setPose("drag");
      timer.current = setTimeout(() => {
        setShadowIn(true);
        anims.current = [animate(y, start.y, { duration: 0.75, ease: [0.55, 0, 0.9, 0.6] })];
        timer.current = setTimeout(() => { setPose("land"); setDust(true); }, 750);
      }, 700);
    } else {
      schedule(600 + index * 450);
    }
    return () => { stop(); clearTimeout(bubbleTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const onTap = () => {
    if (justDragged.current) return;
    if (bubble === domi.name) {
      setBubble(null);
      onOpen();
      return;
    }
    showBubble(domi.name, 3000);
  };

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x, y, zIndex: z, touchAction: "none", marginLeft: -SIZE / 2, marginTop: -SIZE * 1.25 }}
      drag
      dragMomentum={false}
      // Stay inside the field: sideways across the whole (scrolling) world, up into the sky, never below the grass.
      dragConstraints={{ left: bounds.left, right: bounds.right, top: bounds.top - 160, bottom: bounds.bottom }}
      dragElastic={0.08}
      onDragStart={() => {
        stop();
        dragging.current = true;
        justDragged.current = true;
        setBubble("Whoa!");
        setPose("drag");
      }}
      onDragEnd={() => {
        dragging.current = false;
        setBubble(null);
        // Fall back onto the grass if dropped in the sky, then squash on landing.
        const tx = clamp(x.get(), bounds.left, bounds.right);
        const ty = clamp(y.get(), bounds.top, bounds.bottom);
        const fall = ty - y.get();
        anims.current = [
          animate(x, tx, { type: "spring", stiffness: 300, damping: 30 }),
          animate(y, ty, fall > 0 ? { type: "spring", stiffness: 260, damping: 18 } : { duration: 0.12 }),
        ];
        setTimeout(() => setPose("land"), fall > 20 ? 320 : 0);
        positions.set(domi.id, { x: tx, y: ty, name: domi.name });
        setTimeout(() => { justDragged.current = false; }, 50);
      }}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div className="relative">
        <Bubble show={!!bubble}>{bubble}</Bubble>
        {isNew && <span className="absolute -right-1 top-3 z-10 rounded-full bg-pink px-2 py-0.5 text-[11px] font-black text-white shadow">NEW</span>}
        {dust && <Dust />}
        <Domi
          domi={domi}
          size={SIZE}
          pose={pose}
          facing={facing}
          seed={index % 4}
          glow={isNew}
          shadow={shadowIn}
          onTap={onTap}
          onLanded={() => {
            setPose("idle");
            if (falling.current) {
              falling.current = false;
              showBubble(`Hi! I'm ${domi.name}`, 3200);
              setTimeout(() => setDust(false), 700);
              schedule(3400);
            } else schedule(1000);
          }}
        />
      </div>
    </motion.div>
  );
}

/** A puff of dust where a falling Domi lands. */
function Dust() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-1/2" aria-hidden>
      {[-1, -0.5, 0.5, 1].map((d, i) => (
        <motion.span
          key={i}
          className="absolute h-4 w-4 rounded-full bg-white/90"
          initial={{ x: -8, y: -6, scale: 0.4, opacity: 0.9 }}
          animate={{ x: -8 + d * 46, y: -14 - (i % 2) * 8, scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

/* ───────────── Optional grid view ───────────── */

const FILTERS = ["All", "Events", "Exhibits", "Limited"] as const;

function GridSheet({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: (slug: string) => void }) {
  const local = useLocal();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const collection = local?.collection ?? [];
  const list = getDomis().filter((d) =>
    filter === "All" ? true : filter === "Events" ? d.unlock_type === "event" : filter === "Exhibits" ? d.unlock_type === "exhibit" : d.end_date !== null,
  );
  return (
    <Sheet open={open} onClose={onClose} title="All Domis" expandable>
      <div className="scroll-x -mx-5 mb-3 flex shrink-0 gap-2 px-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-10 shrink-0 rounded-full px-4 text-[15px] font-black ${filter === f ? "bg-purple text-white" : "bg-offwhite text-navy/70"}`}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="-mx-5 flex-1 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-3 gap-3 @2xl:grid-cols-4 @3xl:grid-cols-5">
          {list.map((d) => <Tile key={d.id} domi={d} status={statusOf(d, collection)} onOpen={() => onOpen(d.slug)} />)}
        </div>
      </div>
    </Sheet>
  );
}

function Tile({ domi, status, onOpen }: { domi: DomiData; status: DomiStatus; onOpen: () => void }) {
  const owned = status === "found" || status === "new";
  const inner = (
    <div className={`relative flex h-full flex-col items-center rounded-[20px] p-2 pb-2.5 text-center ${owned ? "bg-[#E8F6DF]" : status === "missed" ? "bg-offwhite opacity-55" : "bg-offwhite"}`}>
      {status === "new" && <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-pink px-1.5 text-[10px] font-black text-white">NEW</span>}
      {(status === "limited" || status === "upcoming") && domi.end_date && (
        <span className="absolute -left-1 top-2 z-10 rounded-r-full bg-tangerine py-0.5 pl-2 pr-2 text-[10px] font-black text-white">
          {status === "upcoming" && domi.start_date ? `From ${formatShort(domi.start_date)}` : `Until ${formatShort(domi.end_date)}`}
        </span>
      )}
      {/* Fixed-height art box so every name lines up, whatever the Domi's shape */}
      <div className="flex h-[92px] w-full items-end justify-center">
        <Domi domi={domi} size={70} silhouette={!owned} silhouetteColor="dark" tappable={false} glow={status === "new"} pose={owned ? "idle" : "still"} seed={Number(domi.id.slice(1)) % 4} />
      </div>
      <p className="mt-1 text-[13px] font-black leading-tight">{owned ? domi.name : status === "missed" ? "Missed this one" : "???"}</p>
      {!owned && status !== "missed" && <p className="mt-0.5 text-[11px] font-bold leading-tight text-navy/60">{domi.location_hint}</p>}
    </div>
  );
  if (owned) return <button onClick={onOpen} className="block w-full text-left" aria-label={`${domi.name} memory`}>{inner}</button>;
  // Still hiding at an exhibit? Jump to it (the game points you back to exploring).
  const exhibit = EXHIBITS.find((x) => x.domi_slug === domi.slug);
  return exhibit && status !== "missed" && status !== "upcoming" ? <Link href={`/exhibit/${exhibit.id}`}>{inner}</Link> : inner;
}
