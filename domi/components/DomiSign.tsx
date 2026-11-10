"use client";
/**
 * The little sign that stands next to every hidden Domi: an NFC tag (tap) and a QR code (scan).
 * Used in the collect screens and the reveal, so the Domi visibly comes out of the same sign.
 */
import { NfcIcon } from "./Icons";

export default function DomiSign({ width = 170, className = "" }: { width?: number; className?: string }) {
  const s = width / 170;
  return (
    <div
      className={`relative rounded-[18px] border-[4px] border-purple bg-white shadow-[0_6px_0_#5C2470] ${className}`}
      style={{ width, height: 112 * s, padding: 8 * s }}
      aria-hidden
    >
      <div className="flex h-full items-center gap-2" style={{ gap: 8 * s }}>
        <div className="flex h-full flex-1 flex-col items-center justify-center rounded-xl bg-purple-light/60 text-purple">
          <NfcIcon size={30 * s} />
          <span className="font-black uppercase tracking-wider" style={{ fontSize: 10 * s }}>Tap here</span>
        </div>
        <QrArt size={78 * s} />
      </div>
      <span
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple font-black uppercase tracking-widest text-white"
        style={{ fontSize: 10 * s, padding: `${2 * s}px ${8 * s}px` }}
      >
        Domi
      </span>
    </div>
  );
}

/** A stand-in QR code (not scannable): finder squares + a fixed pattern. */
export function QrArt({ size = 78, color = "#1B2A38" }: { size?: number; color?: string }) {
  const n = 21;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!finder && ((x * 7 + y * 13 + x * y) % 5 < 2)) cells.push([x, y]);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill={color} />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill={color} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="shrink-0 rounded-md bg-white" shapeRendering="crispEdges">
      {cells.map(([x, y]) => <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill={color} />)}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  );
}
