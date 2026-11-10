"use client";
/** Flat, chunky illustrated scenery shared by every screen: sky, clouds, museum dome skyline, hills, trees, sparkles. */
import { useMemo } from "react";
import { SparkIcon } from "./Icons";

export function Clouds({ count = 3, top = 40, spread = 120 }: { count?: number; top?: number; spread?: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 overflow-hidden" style={{ top, height: spread }} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="cloud absolute"
          style={{ top: (i * 37) % spread, animationDuration: `${38 + i * 14}s`, animationDelay: `${-i * 13}s`, opacity: 0.95 - i * 0.12 }}
        >
          <Cloud scale={1 - i * 0.18} />
        </div>
      ))}
    </div>
  );
}

function Cloud({ scale = 1 }: { scale?: number }) {
  return (
    <svg width={120 * scale} height={50 * scale} viewBox="0 0 120 50">
      <path d="M14 46h92a14 14 0 0 0 0-28 20 20 0 0 0-37-8 16 16 0 0 0-28 8A14 14 0 0 0 14 46Z" fill="#fff" />
    </svg>
  );
}

/** The Tech's skyline: the IMAX dome next to the orange building, flat and chunky. */
export function DomeSkyline({ width = 220, className = "" }: { width?: number; className?: string }) {
  return (
    <svg width={width} height={width * 0.45} viewBox="0 0 220 100" className={className} aria-hidden>
      <rect x="92" y="38" width="96" height="62" rx="6" fill="#F58932" />
      <rect x="160" y="38" width="28" height="62" fill="#E06D1E" />
      <rect x="104" y="52" width="14" height="14" rx="3" fill="#FFD9B8" />
      <rect x="126" y="52" width="14" height="14" rx="3" fill="#FFD9B8" />
      <rect x="104" y="74" width="14" height="14" rx="3" fill="#FFD9B8" />
      <rect x="126" y="74" width="20" height="26" rx="3" fill="#0088CE" />
      <path d="M18 100V66a46 46 0 0 1 92 0v34Z" fill="#0088CE" />
      <path d="M36 54a30 30 0 0 1 22-18" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".9" />
      <rect x="10" y="94" width="190" height="6" rx="3" fill="#00659A" opacity=".35" />
    </svg>
  );
}

export function Tree({ size = 48, color = "#2E9E4A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 40 56" aria-hidden>
      <rect x="17" y="34" width="6" height="22" rx="3" fill="#8A5A34" />
      <circle cx="20" cy="22" r="17" fill={color} />
      <circle cx="13" cy="16" r="5" fill="#fff" opacity=".18" />
    </svg>
  );
}

export function Flower({ color = "#ED0289", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 20 32" aria-hidden>
      <rect x="9" y="12" width="2.5" height="20" rx="1" fill="#2E9E4A" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="10" cy="5" rx="3.6" ry="5" fill={color} transform={`rotate(${r} 10 10)`} />
      ))}
      <circle cx="10" cy="10" r="3" fill="#FED602" />
    </svg>
  );
}

/** Layered rolling hills; place at the bottom of a scene. */
export function Hills({ height = 220, className = "" }: { height?: number; className?: string }) {
  return (
    <svg className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`} height={height} viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden>
      <path d="M0 90 C70 40 140 60 200 85 S330 50 400 70 V220 H0Z" fill="#A8E07E" />
      <path d="M0 130 C90 90 170 120 240 125 S360 100 400 115 V220 H0Z" fill="#7FCF5A" />
      <path d="M0 170 C80 150 160 165 230 160 S350 150 400 160 V220 H0Z" fill="#5DBB46" />
    </svg>
  );
}

export function Sparkles({ count = 6, color = "#FED602", seed = 1 }: { count?: number; color?: string; seed?: number }) {
  const items = useMemo(() => scatter(count, seed), [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {items.map((s, i) => (
        <span key={i} className="twinkle absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s`, color }}>
          <SparkIcon size={8 + s.s * 10} />
        </span>
      ))}
    </div>
  );
}

export function Starfield({ count = 60 }: { count?: number }) {
  const stars = useMemo(() => scatter(count, 7), [count]);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((s, i) =>
        i % 6 === 0 ? (
          <span key={i} className="twinkle absolute text-white" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}>
            <SparkIcon size={8 + s.s * 8} />
          </span>
        ) : (
          <span
            key={i}
            className="twinkle absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: 2 + s.s * 2, height: 2 + s.s * 2, animationDelay: `${s.d}s`, animationDuration: `${1.6 + s.s * 2}s` }}
          />
        ),
      )}
    </div>
  );
}

/** Deterministic pseudo-random scatter so server and client render the same. */
function scatter(n: number, seed: number) {
  let x = seed * 9301 + 49297;
  const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => ({ x: r() * 100, y: r() * 100, s: r(), d: r() * 3 }));
}
