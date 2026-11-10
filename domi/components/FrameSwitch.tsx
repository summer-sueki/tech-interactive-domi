"use client";
/**
 * Preview-size switch for people opening the demo on a laptop or desktop: Phone (default) · Tablet · Full.
 * Hidden on real phones and small windows. The choice is remembered per browser (localStorage).
 * The width itself is applied in CSS from <html data-frame="…"> (see globals.css + the script in layout.tsx).
 */
import { useEffect, useState } from "react";

export type Frame = "phone" | "tablet" | "full";
export const FRAME_KEY = "domi:frame";

const OPTIONS: { id: Frame; label: string; icon: React.ReactNode }[] = [
  { id: "phone", label: "Phone", icon: <rect x="7" y="3" width="10" height="18" rx="2.5" /> },
  { id: "tablet", label: "Tablet", icon: <rect x="4" y="3" width="16" height="18" rx="2.5" /> },
  { id: "full", label: "Full", icon: <><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 20h8" /></> },
];

export default function FrameSwitch() {
  const [frame, setFrame] = useState<Frame>("phone");
  useEffect(() => {
    const now = document.documentElement.dataset.frame as Frame | undefined;
    if (now) setFrame(now);
  }, []);
  const pick = (f: Frame) => {
    setFrame(f);
    document.documentElement.dataset.frame = f;
    try { localStorage.setItem(FRAME_KEY, f); } catch { /* private mode: just this visit */ }
  };
  return (
    <div
      role="group"
      aria-label="Preview size"
      className="fixed bottom-4 right-4 z-[100] hidden items-center gap-1 rounded-full bg-navy/85 p-1 text-white shadow-lg backdrop-blur min-[768px]:flex"
    >
      <span className="px-2 text-[11px] font-black uppercase tracking-wider text-white/60">Preview</span>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => pick(o.id)}
          aria-pressed={frame === o.id}
          className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-black transition-colors ${frame === o.id ? "bg-white text-navy" : "text-white/80 hover:bg-white/10"}`}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{o.icon}</svg>
          {o.label}
        </button>
      ))}
    </div>
  );
}
