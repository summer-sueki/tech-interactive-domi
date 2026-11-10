"use client";
/**
 * One reusable animated Domi for every themed variant.
 * The art is a single flat PNG, so all life (squash & stretch, bob, blink, wiggle,
 * prop sway) is faked with layered transforms on the whole image.
 */
import { motion, useAnimationControls, useReducedMotionConfig, type TargetAndTransition } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import type { Domi as DomiData } from "@/lib/types";

export type Pose = "idle" | "walk" | "drag" | "land" | "wave" | "sit" | "shrug" | "still" | "look";

interface Props {
  domi: DomiData | null | undefined;
  size?: number;
  pose?: Pose;
  /** Hidden Domi: solid silhouette. */
  silhouette?: boolean;
  silhouetteColor?: "dark" | "light";
  /** Flip horizontally (walking left). */
  facing?: 1 | -1;
  shadow?: boolean;
  glow?: boolean;
  /** Tap reacts with a random jump / spin / surprised hop. */
  tappable?: boolean;
  onTap?: () => void;
  onLanded?: () => void;
  /** Randomize idle timing so groups don't bob in sync. */
  seed?: number;
  className?: string;
  label?: string;
}

const FALLBACK = "/domis/domi-classic.png";

const POSES: Record<Pose, (s: number) => TargetAndTransition> = {
  idle: (s) => ({
    y: [0, -5, 0, 0],
    scaleY: [1, 1.035, 0.965, 1],
    scaleX: [1, 0.975, 1.03, 1],
    rotate: [0, -1.5, 1.2, 0],
    transition: { duration: 2.2 + s * 0.6, repeat: Infinity, ease: "easeInOut", delay: s * 0.4 },
  }),
  walk: () => ({
    y: [0, -8, 0],
    scaleY: [0.96, 1.05, 0.96],
    scaleX: [1.03, 0.97, 1.03],
    rotate: [-6, 0, 6, 0, -6],
    transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
  }),
  drag: () => ({
    y: 0,
    scaleY: 1.16,
    scaleX: 0.88,
    rotate: [-9, 9, -9],
    transition: {
      scaleY: { type: "spring", stiffness: 500, damping: 12 },
      scaleX: { type: "spring", stiffness: 500, damping: 12 },
      rotate: { duration: 0.7, repeat: Infinity, ease: "easeInOut" },
    },
  }),
  land: () => ({
    y: [0, 0, -14, 0],
    scaleY: [0.7, 1.12, 0.92, 1],
    scaleX: [1.25, 0.92, 1.05, 1],
    rotate: 0,
    transition: { duration: 0.6, times: [0, 0.3, 0.65, 1], ease: "easeOut" },
  }),
  wave: () => ({
    y: [0, -10, 0, -6, 0],
    rotate: [0, -10, 10, -10, 8, 0],
    scaleY: [1, 1.06, 0.95, 1.03, 1],
    scaleX: 1,
    transition: { duration: 1.3, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 },
  }),
  sit: () => ({
    y: 4,
    scaleY: 0.86,
    scaleX: 1.08,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 14 },
  }),
  look: () => ({
    y: 0,
    scaleY: 1,
    scaleX: 1,
    rotate: [0, -7, -7, 7, 7, 0],
    transition: { duration: 2.4, ease: "easeInOut" },
  }),
  shrug: () => ({
    y: [0, -8, 0, 0],
    rotate: [0, -9, 9, 0],
    scaleY: [1, 1.08, 0.94, 1],
    scaleX: [1, 0.95, 1.04, 1],
    transition: { duration: 1.6, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" },
  }),
  still: () => ({ y: 0, scaleY: 1, scaleX: 1, rotate: 0, transition: { duration: 0.2 } }),
};

const TAPS: TargetAndTransition[] = [
  // Big squash-and-stretch jump
  {
    y: [0, 6, -70, 0, -12, 0],
    scaleY: [1, 0.78, 1.22, 0.78, 1.06, 1],
    scaleX: [1, 1.18, 0.86, 1.2, 0.97, 1],
    rotate: 0,
    transition: { duration: 0.85, times: [0, 0.12, 0.42, 0.68, 0.84, 1], ease: "easeOut" },
  },
  // Spin
  {
    y: [0, 4, -40, 0],
    rotate: [0, 0, 360, 360],
    scaleY: [1, 0.82, 1.1, 1],
    scaleX: [1, 1.12, 0.92, 1],
    transition: { duration: 0.8, times: [0, 0.15, 0.7, 1], ease: "easeOut" },
  },
  // Surprised hop + shake
  {
    y: [0, -22, 0, 0, 0],
    rotate: [0, 0, -8, 8, 0],
    scaleY: [1, 1.18, 0.85, 1.02, 1],
    scaleX: [1, 0.9, 1.12, 1, 1],
    transition: { duration: 0.65, ease: "easeOut" },
  },
];

export default function Domi({
  domi,
  size = 120,
  pose = "idle",
  silhouette = false,
  silhouetteColor = "dark",
  facing = 1,
  shadow = true,
  glow = false,
  tappable = true,
  onTap,
  onLanded,
  seed = 0,
  className = "",
  label,
}: Props) {
  const reduce = useReducedMotionConfig();
  const body = useControls();
  const blink = useControls();
  const busy = useRef(false);
  const effectivePose: Pose = reduce ? "still" : pose;

  useEffect(() => {
    if (busy.current) return;
    body.start(POSES[effectivePose](seed)).then(() => {
      if (effectivePose === "land") onLanded?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivePose, seed]);

  // Blink every few seconds: quick vertical squish of the whole character.
  useEffect(() => {
    if (reduce || silhouette) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        blink.start({ scaleY: [1, 0.93, 1], transition: { duration: 0.18 } });
        loop();
      }, 2500 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce, silhouette, blink]);

  const handleTap = useCallback(async () => {
    onTap?.();
    if (!tappable) return;
    if (reduce) {
      await body.start({ opacity: [1, 0.6, 1], transition: { duration: 0.3 } });
      return;
    }
    if (busy.current) return;
    busy.current = true;
    await body.start(TAPS[Math.floor(Math.random() * TAPS.length)]);
    busy.current = false;
    body.start(POSES[effectivePose](seed));
  }, [onTap, tappable, reduce, body, effectivePose, seed]);

  const src = domi?.image ?? FALLBACK;
  const placeholder = !!domi && !domi.image && !silhouette;
  const filter = silhouette
    ? silhouetteColor === "dark"
      ? "brightness(0) opacity(0.78)"
      : "brightness(0) invert(1) opacity(0.35)"
    : placeholder
      ? "grayscale(0.2) hue-rotate(160deg)"
      : undefined;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size * 1.25 }}
      aria-label={label ?? (silhouette ? "Hidden Domi" : domi?.name)}
      role={onTap || tappable ? "button" : "img"}
    >
      {shadow && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/20"
          style={{ bottom: size * 0.02, width: size * 0.72, height: size * 0.11, filter: "blur(1px)" }}
        />
      )}
      {glow && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: "radial-gradient(circle, rgba(255,230,120,.75) 0%, rgba(255,230,120,0) 65%)",
          }}
        />
      )}
      <motion.div
        animate={body}
        onTap={handleTap}
        className="absolute inset-x-0 bottom-[6%] flex items-end justify-center"
        style={{ originX: 0.5, originY: 1, height: "94%", cursor: tappable || onTap ? "pointer" : "default" }}
      >
        <motion.div animate={blink} style={{ originY: 1, scaleX: facing }} className="h-full w-full flex items-end justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none max-h-full max-w-full object-contain"
            style={{ filter, imageRendering: "auto" }}
          />
        </motion.div>
      </motion.div>
      {placeholder && (
        <span className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-navy shadow">
          Art coming soon
        </span>
      )}
    </div>
  );
}

function useControls() {
  return useAnimationControls();
}
