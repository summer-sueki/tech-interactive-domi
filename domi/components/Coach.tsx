"use client";
/** First-visit walkthrough for My Domis: three short steps, narrated by a Domi. */
import { AnimatePresence, motion } from "framer-motion";
import Domi from "./Domi";
import { getDomiBySlug } from "@/lib/data";

export const COACH_STEPS = [
  { target: "coach-field", title: "These are your Domis!", body: "Tap one to say hi." },
  { target: "coach-found", title: "Explore to find more", body: "Look for the Domi sign at exhibits." },
  { target: "coach-found", title: "Found one?", body: "Tap Find at the bottom, then tap the sign." },
];

export default function Coach({ step, onNext, onSkip }: { step: number | null; onNext: () => void; onSkip: () => void }) {
  const s = step === null ? null : COACH_STEPS[step];
  return (
    <AnimatePresence>
      {s && (
        <motion.div
          key={step}
          className="absolute inset-x-3 z-50 rounded-[26px] bg-navy p-4 text-white shadow-2xl"
          style={{ bottom: "calc(92px + env(safe-area-inset-bottom))" }}
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          role="dialog" aria-label="How My Domis works"
        >
          <div className="flex gap-3">
            <div className="-mt-10 shrink-0"><Domi domi={getDomiBySlug("happy")} size={70} pose="wave" shadow={false} /></div>
            <div className="min-w-0 flex-1">
              <p className="display text-[19px] leading-tight">{s.title}</p>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-white/85">{s.body}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5" aria-label={`Step ${step! + 1} of ${COACH_STEPS.length}`}>
              {COACH_STEPS.map((_, i) => <span key={i} className={`h-2 rounded-full ${i === step ? "w-6 bg-gold" : "w-2 bg-white/30"}`} />)}
            </div>
            <div className="flex items-center gap-2">
              {step! < COACH_STEPS.length - 1 && <button onClick={onSkip} className="h-11 px-3 text-sm font-black text-white/70">Skip</button>}
              <button onClick={onNext} className="chunky h-11 rounded-full bg-gold px-5 text-[15px] text-navy" style={{ ["--btn-edge" as string]: "#C08412", borderRadius: 999 }}>
                {step! < COACH_STEPS.length - 1 ? "Next" : "Got it!"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
