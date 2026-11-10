"use client";
/**
 * "I found the Domi!" → collect it from the sign next to it. Two ways, both open /found/<code>:
 *  1. Tap the NFC tag. Phones open the link natively; on Android Chrome we also listen with Web NFC.
 *  2. Scan the QR code. In-app camera (BarcodeDetector where supported), or the phone's camera app.
 *  (Quiet fallback: type the code printed under the QR.)
 * The tag's link carries ?via=nfc / ?via=qr so the reveal can start from the sign.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Sheet from "./Sheet";
import DomiSign, { QrArt } from "./DomiSign";
import { CloseIcon, NfcIcon, QrIcon } from "./Icons";
import { codeFor } from "@/lib/data";
import type { Domi } from "@/lib/types";

const SHOW_DEV = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEV === "1";
type Mode = "choose" | "nfc" | "qr";

export default function CollectSheet({ open, onClose, domi }: { open: boolean; onClose: () => void; domi?: Domi; where?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  useEffect(() => { if (open) setMode("choose"); }, [open]);
  const go = (via: "nfc" | "qr", path = domi ? `/found/${codeFor(domi)}` : "") => path && router.push(`${path}?via=${via}`);

  return (
    <>
      <Sheet open={open && mode === "choose"} onClose={onClose} title="Collect your Domi">
        <div className="pb-4">
          <p className="font-bold text-navy/60">Use the sign next to it.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Way color="#7F3896" edge="#5C2470" icon={<NfcIcon size={34} />} title="Tap" sub="Hold your phone on the sign" onClick={() => setMode("nfc")} />
            <Way color="#F58932" edge="#C4621A" icon={<QrIcon size={34} />} title="Scan" sub="Point your camera at the code" onClick={() => setMode("qr")} />
          </div>
          <CodeEntry open={open} />
        </div>
      </Sheet>
      <AnimatePresence>
        {open && mode === "nfc" && <NfcScreen key="nfc" onClose={() => setMode("choose")} onTapped={(p) => go("nfc", p)} canSimulate={!!domi} />}
        {open && mode === "qr" && <QrScreen key="qr" onClose={() => setMode("choose")} onScanned={(p) => go("qr", p)} canSimulate={!!domi} />}
      </AnimatePresence>
    </>
  );
}

/** Fallback, kept quiet: type the code printed under the QR (for when tapping and scanning don't work). */
function CodeEntry({ open }: { open: boolean }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  useEffect(() => { if (open) { setShow(false); setCode(""); } }, [open]);
  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="mx-auto mt-4 block py-1 text-[14px] font-bold text-navy/55">
        Can&apos;t tap or scan? <span className="underline">Enter the code</span>
      </button>
    );
  }
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => { e.preventDefault(); const c = code.trim(); if (c) router.push(`/found/${encodeURIComponent(c)}`); }}
    >
      <input
        autoFocus value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="DOMI-XXXX" aria-label="Domi code" autoCapitalize="characters" autoComplete="off"
        className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-navy/15 px-4 text-[16px] font-black tracking-widest outline-none focus:border-purple"
      />
      <button type="submit" disabled={!code.trim()} className="h-12 shrink-0 rounded-2xl bg-navy/10 px-4 text-[15px] font-black text-navy/70 disabled:opacity-50">Go</button>
    </form>
  );
}

function Way({ color, edge, icon, title, sub, onClick }: { color: string; edge: string; icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="chunky flex flex-col items-center rounded-[24px] px-3 pb-4 pt-5 text-center text-white"
      style={{ background: color, ["--btn-edge" as string]: edge, borderRadius: 24 }}
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20">{icon}</span>
      <span className="display mt-2 text-[24px] leading-none">{title}</span>
      <span className="mt-1 text-[13px] font-bold leading-tight text-white/85">{sub}</span>
    </button>
  );
}

/** Pull the /found/<code> path out of a scanned or tapped URL. */
function foundPath(raw: string) {
  const m = raw.match(/\/found\/([A-Za-z0-9-]+)/);
  return m ? `/found/${m[1]}` : null;
}

function Shell({ children, onClose, bg }: { children: React.ReactNode; onClose: () => void; bg: string }) {
  return (
    <motion.div
      className={`absolute inset-0 z-[60] flex flex-col overflow-hidden ${bg}`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="pt-safe relative z-20 flex justify-end px-4 pt-2">
        <button onClick={onClose} aria-label="Close" className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white"><CloseIcon /></button>
      </div>
      {children}
    </motion.div>
  );
}

/* ───────────── NFC: hold the phone on the sign ───────────── */

function NfcScreen({ onClose, onTapped, canSimulate }: { onClose: () => void; onTapped: (path?: string) => void; canSimulate: boolean }) {
  const [tapped, setTapped] = useState(false);
  const tap = (path?: string) => {
    if (tapped) return;
    setTapped(true);
    // Phone touches the sign, the ripple fires, then the reveal starts from the same spot.
    setTimeout(() => onTapped(path), 750);
  };

  // Android Chrome can read the tag inside the app. iPhone opens the tag's link by itself.
  useEffect(() => {
    const W = window as unknown as { NDEFReader?: new () => { scan: () => Promise<void>; onreading: ((e: { message: { records: { recordType: string; data: DataView }[] } }) => void) | null } };
    if (!W.NDEFReader) return;
    const ctrl = { off: false };
    try {
      const reader = new W.NDEFReader();
      reader.scan().then(() => {
        reader.onreading = (e) => {
          if (ctrl.off) return;
          for (const r of e.message.records) {
            if (r.recordType !== "url") continue;
            const path = foundPath(new TextDecoder().decode(r.data));
            if (path) tap(path);
          }
        };
      }).catch(() => {});
    } catch { /* not allowed here */ }
    return () => { ctrl.off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell onClose={onClose} bg="bg-gradient-to-b from-purple to-[#B35BCB]">
      <div className="relative z-10 px-6 text-center text-white">
        <h2 className="display text-[30px] leading-tight">{tapped ? "Got it!" : "Touch the top of your phone to the sign"}</h2>
      </div>

      <div className="relative flex-1">
        {/* The sign + the tap point (same spot the reveal starts from) */}
        <div className="absolute inset-x-0 top-[22%] flex justify-center">
          <div className="relative">
            <DomiSign width={190} />
            {/* The phone waits below the tag, then springs up so its top edge touches it */}
            <motion.div
              className="absolute left-[27%] top-full z-10 -ml-[34px] mt-20"
              animate={tapped ? { y: -150, rotate: 0 } : { y: [0, -26, 0], rotate: [5, 1, 5] }}
              transition={tapped ? { type: "spring", stiffness: 380, damping: 17 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Phone />
            </motion.div>
            <TapRipple active={tapped} />
          </div>
        </div>
      </div>

      <div className="pb-safe relative z-10 px-5 pb-6">
        {SHOW_DEV && canSimulate && !tapped && <Button color="grey" size="M" onClick={() => tap()}>DEV: Simulate a tap</Button>}
      </div>
    </Shell>
  );
}

export function TapRipple({ active, className = "left-[27%] top-[46%]" }: { active: boolean; className?: string }) {
  return (
    <div className={`pointer-events-none absolute z-20 ${className}`} aria-hidden>
      {(active ? [0, 1, 2] : [0]).map((i) => (
        <motion.span
          key={`${active}-${i}`}
          className="absolute -left-6 -top-6 h-12 w-12 rounded-full border-[3px] border-gold"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: active ? 4 : 1.8, opacity: 0 }}
          transition={{ duration: active ? 0.9 : 1.6, delay: i * 0.12, repeat: active ? 0 : Infinity, ease: "easeOut" }}
        />
      ))}
      {active && <motion.span className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-gold" initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 0] }} transition={{ duration: 0.6 }} />}
    </div>
  );
}

function Phone() {
  return (
    <div className="relative h-[118px] w-[68px] rounded-[16px] border-[5px] border-navy bg-gradient-to-b from-[#BFE3F6] to-white shadow-xl">
      <span className="absolute left-1/2 top-1.5 h-1.5 w-6 -translate-x-1/2 rounded-full bg-navy" />
      <span className="absolute inset-x-0 top-9 text-center text-purple"><NfcIcon size={26} className="mx-auto" /></span>
    </div>
  );
}

/* ───────────── QR: point the camera at the code ───────────── */

/**
 * Stand-in for the live camera (prototype / no camera): a photo of a Domi with its QR sign at an exhibit,
 * framed so the Domi and QR sit in the scan brackets. When the code locks, the view zooms into the QR.
 * Photo: public/exhibits/scan-scene.jpg (1536×1118). QR at 32.2% / 45.9%, Domi just right of it.
 */
const SCENE = { aspect: 1536 / 1118, qr: { x: 0.322, y: 0.459 }, frame: { x: 0.35, y: 0.46 }, h: 107 };
function CameraMock({ locked }: { locked: boolean }) {
  const W = SCENE.h * SCENE.aspect; // image width in dvh
  return (
    <div className="absolute inset-0 overflow-hidden bg-night" aria-hidden>
      <motion.img
        src="/exhibits/scan-scene.jpg"
        alt=""
        className="absolute max-w-none"
        style={{
          height: `${SCENE.h}dvh`,
          width: `${W}dvh`,
          left: `calc(50% - ${SCENE.frame.x * W}dvh)`,
          top: `calc(50% - ${SCENE.frame.y * SCENE.h}dvh)`,
          transformOrigin: `${SCENE.qr.x * 100}% ${SCENE.qr.y * 100}%`,
        }}
        initial={false}
        animate={locked ? { scale: 2.3, x: `${(SCENE.frame.x - SCENE.qr.x) * W}dvh`, filter: "blur(1.5px)" } : { scale: 1, x: "0dvh", filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 160, damping: 20 }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,.5)_100%)]" />
    </div>
  );
}

function QrScreen({ onClose, onScanned, canSimulate }: { onClose: () => void; onScanned: (path?: string) => void; canSimulate: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [camOk, setCamOk] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const lock = (path?: string) => {
    if (locked) return;
    setLocked(true);
    setTimeout(() => onScanned(path), 800);
  };

  useEffect(() => {
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (video.current) { video.current.srcObject = s; video.current.play().catch(() => {}); }
        setCamOk(true);
        // Decode QR codes where the browser can (Chrome on Android). Otherwise the phone's camera app works too.
        const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
        if (!BD) return;
        const detector = new BD({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          if (!video.current || video.current.readyState < 2) return;
          const codes = await detector.detect(video.current).catch(() => []);
          const path = codes.map((c) => foundPath(c.rawValue)).find(Boolean);
          if (path) { clearInterval(timer); lock(path); }
        }, 350);
      })
      .catch(() => setCamOk(false));
    return () => { clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const corner = locked ? "border-green" : "border-gold";
  return (
    <Shell onClose={onClose} bg="bg-black">
      <video ref={video} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
      {camOk !== true && <CameraMock locked={locked} />}
      <div className="relative z-10 px-6 text-center text-white">
        <h2 className="display text-[30px] leading-tight drop-shadow">{locked ? "Got it!" : "Point at the QR code"}</h2>
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <motion.div className="relative h-60 w-60" animate={locked ? { scale: [1, 0.86, 0.92] } : { scale: 1 }} transition={{ duration: 0.4 }}>
          {["left-0 top-0 border-l-8 border-t-8 rounded-tl-3xl", "right-0 top-0 border-r-8 border-t-8 rounded-tr-3xl", "left-0 bottom-0 border-l-8 border-b-8 rounded-bl-3xl", "right-0 bottom-0 border-r-8 border-b-8 rounded-br-3xl"].map((c) => (
            <span key={c} className={`absolute h-14 w-14 transition-colors ${corner} ${c}`} />
          ))}
          {!locked && <motion.span className="absolute inset-x-4 h-1 rounded-full bg-gold shadow-[0_0_14px_#FED602]" animate={{ top: ["10%", "90%", "10%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />}
          {locked && camOk !== true && (
            // The zoomed-in QR from the photo, sharpened so it reads.
            <motion.span className="absolute inset-0 grid place-items-center" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <span className="rounded-lg bg-white p-1.5 shadow-lg"><QrArt size={180} /></span>
            </motion.span>
          )}
          {locked && (
            <motion.span className="absolute inset-0 grid place-items-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}>
              <span className="grid h-20 w-20 place-items-center rounded-full bg-green text-4xl font-black text-white shadow-lg">✓</span>
            </motion.span>
          )}
        </motion.div>
      </div>
      <div className="pb-safe relative z-10 space-y-2 px-5 pb-6">
        {camOk === false && <p className="text-center text-sm font-bold text-white/70">Your camera app works too.</p>}
        {SHOW_DEV && canSimulate && !locked && <Button color="grey" size="M" onClick={() => lock()}>DEV: Simulate a scan</Button>}
      </div>
    </Shell>
  );
}
